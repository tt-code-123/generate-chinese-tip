import * as vscode from 'vscode'

// this method is called when vs code is activated
export function activate(context: vscode.ExtensionContext) {
  let activeEditor: vscode.TextEditor
  // Get the active editor for the first time
  if (vscode.window.activeTextEditor) {
    activeEditor = vscode.window.activeTextEditor
  }
}

// This method is called when your extension is deactivated
export function deactivate() {}
