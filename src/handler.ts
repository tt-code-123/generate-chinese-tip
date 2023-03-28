import { DecorationOptions, TextEditor } from "vscode";
import { Configuration } from "./configuration";
import { Global } from "./global";

import { get } from "lodash";

export class Handler {
  private decorations: DecorationOptions[] = [];
  private configInfo: Contributions;
  private i18nConfiguration: I18NFileType;

  constructor(configuration: Configuration) {
    this.configInfo = configuration.getConfigInfo();
    this.i18nConfiguration = configuration.getI18nFileObj();
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
    const reg = /(I18N)(\.[a-zA-Z0-9_]{0,}){1,}[\s\},\)]/gm;
    const text = activeEditor.document.getText();
    const matchList: any = [...text.matchAll(reg)];
    const decorationOptions: DecorationOptions[] = [];

    matchList.forEach(async (match: any, index: number) => {
      const startPos = activeEditor.document.positionAt(match.index);
      const textLine = activeEditor.document.lineAt(startPos);
      const range = textLine.range;
      const str: string = match[0];
      const strPath: string = str.replace(/[\s\},\)]/, "");

      decorationOptions.push({
        range,
        renderOptions: {
          after: {
            ...this.configInfo.style,
            fontStyle: this.configInfo.style.italic ? "italic" : "normal",
            textDecoration: this.configInfo.style.underline
              ? "underline"
              : "normal",
            contentText: (get(this.i18nConfiguration, strPath) as string) || "",
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
