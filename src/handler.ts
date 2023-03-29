import {
  DecorationOptions,
  TextEditor,
  Uri,
  FileType,
  workspace,
  window,
  Range,
  TextLine,
} from "vscode";
import { Configuration } from "./configuration";
import { Global } from "./global";

import { get } from "lodash";
import { Contributions, I18NFileType } from "./types";
import { formateStrToHump, getRootPath } from "./utils";

export class Handler {
  private configInfo: Contributions;
  private decorations: DecorationOptions[] = [];
  private i18nConfiguration: I18NFileType = {};
  static that: any;

  constructor(configuration: Configuration) {
    Handler.that = this;
    this.configInfo = configuration.getConfigInfo();
  }

  generateDecorations(range: Range, text: string) {
    return {
      range,
      renderOptions: {
        after: {
          ...this.configInfo.style,
          fontStyle: this.configInfo.style.italic ? "italic" : "normal",
          textDecoration: this.configInfo.style.underline
            ? "underline"
            : "normal",
          contentText: text,
          margin: "0 0 0 16px",
        },
      },
    };
  }

  generateTextLineInfo(activeEditor: TextEditor, index: number): TextLine {
    const startPos = activeEditor.document.positionAt(index);
    const textLine = activeEditor.document.lineAt(startPos);
    return textLine;
  }

  static async initI18nFileObj() {
    const rootPath = getRootPath();
    const langsPath: string = `${rootPath}/src/i18n/langs`;
    if (rootPath) {
      const obj: I18NFileType = {};
      try {
        const res = await workspace.fs.readDirectory(Uri.file(langsPath));
        const directoryArr = res.filter(
          (item) => item[1] === FileType.Directory
        );

        for (let index = 0; index < directoryArr.length; index++) {
          const path = directoryArr[index][0];
          obj[path] = await Handler.prototype.recursionReadDirectory(
            `${langsPath}/${path}`
          );
        }

        Handler.that.i18nConfiguration = {
          ["I18N"]: obj,
        };
      } catch (error) {
        window.showInformationMessage("请配置i18n文件！");
      }
    }
  }

  async recursionReadDirectory(path: string): Promise<I18NFileType> {
    const obj: I18NFileType = {};
    const initPath = Uri.file(path);
    const res = await workspace.fs.readDirectory(initPath);
    const directoryArr = res.filter((item) => item[1] === FileType.Directory);

    if (directoryArr.length === 0) {
      const contentObj: I18NFileType = {};
      const fileContentBuffer = await workspace.fs.readFile(
        Uri.file(`${path}/index.ts`)
      );
      const fileContentStr = fileContentBuffer.toString();
      let replaceStr = fileContentStr
        .replace(/'/g, `"`)
        .replace(/\/\*[\s\S]{0,}?\*\//g, "");

      const contentStr = [...replaceStr.matchAll(/\{([\s\S]{0,})\}/g)];

      contentStr.forEach((item) => {
        item[1]
          .split(",")
          .map((str) => str.trim())
          .filter(Boolean)
          .map((str) => str.split(":"))
          .forEach((str) => {
            contentObj[str[0]] = str[1]?.replace(/"/g, "")?.trim();
          });
      });
      return { index: contentObj };
    }
    for (let index = 0; index < directoryArr.length; index++) {
      const pathAddress = directoryArr[index][0];
      if (directoryArr.find((ele) => ele[0] === "zh-CN")) {
        // return 终止for循环 只执行一次zh-CN
        return await this.recursionReadDirectory(`${path}/zh-CN`);
      } else {
        const humpPath = formateStrToHump(pathAddress);
        obj[humpPath] = await this.recursionReadDirectory(
          `${path}/${pathAddress}`
        );
      }
    }
    return obj;
  }

  matchI18NRegular(activeEditor: TextEditor) {
    const reg = /(I18N)(\.[a-zA-Z0-9_]{0,}){1,}[\s\},\)]/gm;
    const text = activeEditor.document.getText();
    const matchList = [...text.matchAll(reg)];
    const decorationOptions: DecorationOptions[] = [];

    matchList.forEach(async (match: any) => {
      const textLine = this.generateTextLineInfo(activeEditor, match.index);
      const range = textLine.range;
      const str: string = match[0];
      const strPath: string = str.replace(/[\s\},\)]/, "");

      const contentText = get(this.i18nConfiguration, strPath);
      let decorationArr = [];

      if (typeof contentText === "object") {
        decorationArr = this.matchI18NVariable(activeEditor, strPath);
      }
      decorationOptions.push(
        this.generateDecorations(range, contentText as string)
      );
      decorationOptions.push(...decorationArr);
    });
    this.decorations = decorationOptions;
  }

  matchI18NVariable(activeEditor: TextEditor, expressionPath: string) {
    const decorationArr: any[] = [];
    const text = activeEditor.document.getText();
    const textLine = this.generateTextLineInfo(
      activeEditor,
      text.indexOf(expressionPath)
    );

    const textLineInfoArr = textLine.text.trim().split(" ");
    const regStr = textLineInfoArr[1] + "\\.{1,}[a-zA-Z0-9_.]{1,}";
    const reg = new RegExp(regStr, "g");
    const matchList = [...text.matchAll(reg)];

    matchList.forEach((item) => {
      const i18nExpressionPath = item[0].replace(
        textLineInfoArr[1],
        expressionPath
      );
      const textLineItem = this.generateTextLineInfo(activeEditor, item.index!);
      const range = textLineItem.range;

      decorationArr.push(
        this.generateDecorations(
          range,
          get(this.i18nConfiguration, i18nExpressionPath) as string
        )
      );
    });
    return decorationArr;
  }

  applyDecorations(activeEditor: TextEditor): void {
    activeEditor.setDecorations(Global.decorationType, this.decorations);
  }
}
