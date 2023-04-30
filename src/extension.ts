import { TextEditor, ExtensionContext, window, workspace } from "vscode";
import { registerAllCommands } from "./commands";
import { Configuration } from "./configuration";
import { Global } from "./global";
import { Handler } from "./handler";
import { getRootPath } from "./utils";
import { Contributions, ModeEnum } from "./types";
import { SETTING_PREFIX } from "./const";

// this method is called when vs code is activated
export async function activate(context: ExtensionContext) {
  registerAllCommands(context);

  const configuration = new Configuration();
  const handler = new Handler(configuration);
  let activeEditor: TextEditor;
  let timeout: NodeJS.Timer;
  let configInfo = configuration.getConfigInfo();

  const rootPath = getRootPath();
  if (rootPath) {
    const res = await Handler.initI18nFileObj(`${rootPath}/src/i18n/langs`);
    Handler.setI18nConfiguration({
      I18N: {
        ...res,
      },
    });
  }

  // 执行翻译
  const translate = function () {
    if (
      !activeEditor ||
      !configInfo.enabledTranslateFiles.includes(
        activeEditor.document.languageId
      ) ||
      !configInfo.enabledTranslateFiles
    ) {
      return;
    }
    Global.decorationType?.dispose();
    Global.setDecorationType(window.createTextEditorDecorationType({}));
    handler.matchI18NRegular(activeEditor);
    configInfo.mode === ModeEnum.TIP
      ? handler.applyDecorations(activeEditor)
      : handler.applyReplace(activeEditor);
  };

  // 避免频繁调用update
  function triggerUpdateTranslate() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(translate, 1000);
  }

  // 获取活动编辑器并执行首次翻译
  if (window.activeTextEditor) {
    activeEditor = window.activeTextEditor;
    triggerUpdateTranslate();
  }

  // 如果在同一文档中更改了文本，则触发更新
  const changeTextDisposable = workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateTranslate();
      }
    },
    null,
    context.subscriptions
  );

  // 活动编辑器更改时触发的事件
  const changeActiveTextDisposable = window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (editor) {
        activeEditor = editor;
        triggerUpdateTranslate();
      }
    },
    null,
    context.subscriptions
  );

  // 监听配置的修改
  const changeAConfigurationDisposable = workspace.onDidChangeConfiguration(
    (event) => {
      if (event.affectsConfiguration(`${SETTING_PREFIX}.mode`)) {
        const config = workspace
          .getConfiguration()
          .get(SETTING_PREFIX) as Contributions;
        configuration.setConfigInfo(config);
        handler.setConfigInfo(config);
        configInfo = configuration.getConfigInfo();
        triggerUpdateTranslate();
      }
    }
  );

  context.subscriptions.push(
    changeTextDisposable,
    changeActiveTextDisposable,
    changeAConfigurationDisposable
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}
