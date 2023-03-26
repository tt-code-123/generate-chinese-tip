import { DecorationOptions, TextEditor } from 'vscode'
import { Configuration } from './configuration'

export class Handler {
  private decorations: DecorationOptions[] = []
  private configInfo: Contributions

  constructor(configuration: Configuration) {
    this.configInfo = configuration.getConfigInfo()
  }

  getDecorations() {
    return this.decorations
  }

  setDecoration(decoration: DecorationOptions) {
    this.decorations.push(decoration)
  }

  applyDecorations(activeEditor: TextEditor): void {
    activeEditor.setDecorations(
      {
        key: '',
        dispose: () => {},
      },
      this.decorations,
    )
  }
}
