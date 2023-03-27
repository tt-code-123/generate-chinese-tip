import { DecorationOptions, TextEditor, workspace, Uri } from 'vscode'
import { Configuration } from './configuration'
import { Global } from './global'

export class Handler {
  private decorations: DecorationOptions[] = []
  private configInfo: Contributions

  constructor(configuration: Configuration) {
    this.configInfo = configuration.getConfigInfo()
  }

  getDecorations() {
    return this.decorations
  }

  setDecoration(decoration: DecorationOptions[]) {
    this.decorations = decoration
  }

  resetDecoration() {
    this.decorations = []
  }

  matchRegular(activeEditor: TextEditor) {
    const reg = /(I18N)(\.[a-zA-Z0-9_]{0,}){1,}[\s\},\)]/gm
    const text = activeEditor.document.getText()
    const matchList: any = [...text.matchAll(reg)]
    const decorationOptions: DecorationOptions[] = []
    console.log(workspace.workspaceFolders)

    console.log('matchList', matchList)

    matchList.forEach(async (match: any, index: number) => {
      const startPos = activeEditor.document.positionAt(match.index)
      const textLine = activeEditor.document.lineAt(startPos)
      const range = textLine.range
      const str: string = match[0]
      const arrPath: string[] = str.replace(/[\s\},\)]/, '').split('.')
      arrPath.splice(0, 1, 'i18n')
      arrPath.splice(1, 0, 'langs')
      arrPath.splice(3, 0, 'zh-CN')
      const strPath: string = arrPath.join('/')

      decorationOptions.push({
        range,
        renderOptions: {
          after: {
            ...this.configInfo.style,
            fontStyle: this.configInfo.style.italic ? 'italic' : 'normal',
            textDecoration: this.configInfo.style.underline
              ? 'underline'
              : 'normal',
            contentText: '123_' + index,
            margin: '0 0 0 16px',
          },
        },
      })
    })
    this.setDecoration(decorationOptions)
  }

  applyDecorations(activeEditor: TextEditor): void {
    activeEditor.setDecorations(Global.decorationType, this.decorations)
  }
}
