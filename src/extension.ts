import * as vscode from "vscode";
import { Configuration } from "./configuration";
import { Global } from "./global";
import { Handler } from "./handler";

// this method is called when vs code is activated
export async function activate(context: vscode.ExtensionContext) {
  const configuration = new Configuration();
  await configuration.initI18nFileObj();
  const handler = new Handler(configuration);
  const configInfo = configuration.getConfigInfo();
  let activeEditor: vscode.TextEditor;
  let timeout: NodeJS.Timer;

  // 执行翻译
  const translate = function () {
    if (
      !activeEditor ||
      !configInfo.enabledTranslateFiles.includes(
        activeEditor.document.languageId
      )
    ) {
      return;
    }
    Global.decorationType?.dispose();
    Global.setDecorationType(vscode.window.createTextEditorDecorationType({}));
    handler.matchRegular(activeEditor);
    handler.applyDecorations(activeEditor);
  };

  // 获取活动编辑器并执行首次翻译
  if (vscode.window.activeTextEditor) {
    activeEditor = vscode.window.activeTextEditor;
    triggerUpdateTranslate();
  }

  // 扩展时触发的事件
  vscode.extensions.onDidChange(
    () => {
      triggerUpdateTranslate();
    },
    null,
    context.subscriptions
  );

  // 如果在同一文档中更改了文本，则触发更新
  vscode.workspace.onDidChangeTextDocument(
    (event) => {
      if (activeEditor && event.document === activeEditor.document) {
        triggerUpdateTranslate();
      }
    },
    null,
    context.subscriptions
  );

  // 活动编辑器更改时触发的事件
  vscode.window.onDidChangeActiveTextEditor(
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
