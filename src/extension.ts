import { TextEditor, ExtensionContext, window, workspace } from "vscode";
import { registerAllCommands } from "./commands";
import { Configuration } from "./configuration";
import { Global } from "./global";
import { Handler } from "./handler";

// this method is called when vs code is activated
export async function activate(context: ExtensionContext) {
  registerAllCommands(context);

  const configuration = new Configuration();
  const handler = new Handler(configuration);
  let activeEditor: TextEditor;
  let timeout: NodeJS.Timer;

  const configInfo = configuration.getConfigInfo();

  await Handler.initI18nFileObj();

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
    handler.applyDecorations(activeEditor);
  };

  // 获取活动编辑器并执行首次翻译
  if (window.activeTextEditor) {
    activeEditor = window.activeTextEditor;
    triggerUpdateTranslate();
  }

  // 如果在同一文档中更改了文本，则触发更新
  workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateTranslate();
      }
    },
    null,
    context.subscriptions
  );

  // 活动编辑器更改时触发的事件
  window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (editor) {
        activeEditor = editor;
        triggerUpdateTranslate();
      }
    },
    null,
    context.subscriptions
  );

  // 避免频繁调用update
  function triggerUpdateTranslate() {
    if (timeout) {
      clearTimeout(timeout);
    }
    timeout = setTimeout(translate, 1000);
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
