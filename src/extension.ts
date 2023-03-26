import * as vscode from 'vscode'
import { Configuration } from './configuration'
import { Handler } from './handler'

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  const configuration = new Configuration()
  const handler = new Handler(configuration)
  const configInfo = configuration.getConfigInfo()
  let activeEditor: vscode.TextEditor
  let timeout: NodeJS.Timer

  // 执行翻译
  const translate = function () {
    if (
      !activeEditor ||
      !configInfo.enabledTranslateFiles.includes(
        activeEditor.document.languageId,
      )
    ) {
      return
    }
    handler.applyDecorations(activeEditor)
  }

  // 获取活动编辑器并执行首次翻译
  if (vscode.window.activeTextEditor) {
    activeEditor = vscode.window.activeTextEditor
    triggerUpdateTranslate()
  }

  // 扩展时触发的事件
  vscode.extensions.onDidChange(
    () => {
      triggerUpdateTranslate()
    },
    null,
    context.subscriptions,
  )

  // 活动编辑器更改时触发的事件
  vscode.window.onDidChangeActiveTextEditor(
    async (editor) => {
      if (editor) {
        activeEditor = editor
        triggerUpdateTranslate()
      }
    },
    null,
    context.subscriptions,
  )

  // 避免频繁调用update
  function triggerUpdateTranslate() {
    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(translate, 100)
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
