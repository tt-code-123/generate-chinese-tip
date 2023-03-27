import { DecorationOptions, TextEditor } from "vscode";
import { Configuration } from "./configuration";
import { Global } from "./global";

export class Handler {
  private decorations: DecorationOptions[] = [];
  private configInfo: Contributions;

  constructor(configuration: Configuration) {
    this.configInfo = configuration.getConfigInfo();
  }

  getDecorations() {
    return this.decorations;
  }

  setDecoration(decoration: DecorationOptions[]) {
    this.decorations = decoration;
  }

  resetDecoration() {
    this.decorations = [];
  }

  matchRegular(activeEditor: TextEditor) {
    const reg = /I18N\.[a-zA-Z\.0-9]{1,}(\s|(\}))/gm;
    const text = activeEditor.document.getText();
    const matchList: any = [...text.matchAll(reg)];
    const decorationOptions: DecorationOptions[] = [];

    matchList.forEach((match: any, index: number) => {
      const startPos = activeEditor.document.positionAt(match.index);
      const textLine = activeEditor.document.lineAt(startPos);
      const range = textLine.range;

      decorationOptions.push({
        range,
        renderOptions: {
          after: {
            ...this.configInfo.style,
            fontStyle: this.configInfo.style.italic ? "italic" : "normal",
            textDecoration: this.configInfo.style.underline
              ? "underline"
              : "normal",
            contentText: "123_" + index,
            margin: "0 0 0 16px",
          },
        },
      });
    });
    this.setDecoration(decorationOptions);
  }

  applyDecorations(activeEditor: TextEditor): void {
    activeEditor.setDecorations(Global.decorationType, this.decorations);
  }
}
