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

import { get, isEmpty } from "lodash";
import { Contributions, I18NFileType } from "./types";
import { formateStrToHump } from "./utils";
import * as ts from "typescript";

export class Handler {
  private configInfo: Contributions;
  private decorations: DecorationOptions[] = [];
  private i18nConfiguration: I18NFileType = {};
  static that: any;

  constructor(configuration: Configuration) {
    Handler.that = this;
    this.configInfo = configuration.getConfigInfo();
  }

  /**
   * 生成装饰配置
   * @param {Range} range 范围
   * @param {string} text 显示的文本
   */
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

  /**
   * 生成位置信息
   * @param {TextEditor} activeEditor vscode文档编辑器对象
   * @param {RegExpMatchArray} match 正则表达式匹配返回的数组
   */
  generatePositionInfo(
    activeEditor: TextEditor,
    match: RegExpMatchArray
  ): { range: Range; textLine: TextLine } {
    const startPos = activeEditor.document.positionAt(match.index!);
    const endPos = startPos.with({
      character:
        startPos.character + match[0].indexOf(match[2]) + match[2].length,
    });
    const textLine = activeEditor.document.lineAt(startPos);
    return {
      range: new Range(startPos, endPos),
      textLine,
    };
  }

  /**
   * 初始化词条信息
   * @param {string} pathName 文件路径
   */
  static async initI18nFileObj(pathName: string): Promise<any> {
    const formatePath = Uri.file(pathName);
    const obj: I18NFileType = {};
    try {
      const fileStat = await workspace.fs.stat(formatePath);

      if (fileStat.type === FileType.File) {
        // 文件
        const fileContentBuffer = await workspace.fs.readFile(formatePath);
        const entryObj = Handler.prototype.getEntriesInfo(
          fileContentBuffer.toString()
        );
        if (entryObj) {
          return {
            ...entryObj,
          };
        }
      } else {
        // 文件夹
        const files = await workspace.fs.readDirectory(formatePath);
        for (let index = 0; index < files.length; index++) {
          if (files.findIndex((ele) => ele[0] === "zh-CN") > -1) {
            // return 终止for循环 只执行一次zh-CN
            return await Handler.initI18nFileObj(`${pathName}/zh-CN`);
          }
          const absPath = `${pathName}/${files[index][0]}`;
          const entryObj = await Handler.initI18nFileObj(absPath);
          if (!isEmpty(entryObj)) {
            const key = formateStrToHump(files[index][0]).replace(
              /(\.[a-zA-Z]{1,}){1,}/g,
              ""
            );
            obj[key] = entryObj;
          }
        }
      }
      return obj;
    } catch (error) {
      window.showInformationMessage("请配置i18n文件！");
    }
  }

  /**
   * 在源文件中获取词条信息
   * @param {string} code 源代码
   */
  getEntriesInfo(code: string): any {
    let entryObj;
    const ast = ts.createSourceFile(
      "",
      code,
      ts.ScriptTarget.ES2015,
      true,
      ts.ScriptKind.TSX
    );

    function getObject(propertyAssignment: ts.ObjectLiteralElementLike[]): any {
      const entryInfo = propertyAssignment.reduce((pre, curr) => {
        const key = (curr.name as ts.Identifier).escapedText as string;
        const chidProperties = (
          (curr as ts.PropertyAssignment)
            ?.initializer as ts.ObjectLiteralExpression
        )?.properties;
        if (chidProperties?.length > 0) {
          return {
            ...pre,
            [key]: getObject(
              chidProperties as unknown as ts.ObjectLiteralElementLike[]
            ),
          };
        } else {
          const value = (curr as ts.PropertyAssignment).initializer
            .getText()
            .replace(/'/g, "");
          return {
            ...pre,
            [key]: value,
          };
        }
      }, {});
      return entryInfo;
    }

    function visit(node: ts.Node) {
      switch (node.kind) {
        case ts.SyntaxKind.ObjectLiteralExpression:
          const { properties, parent } = <ts.ObjectLiteralExpression>node;
          if (parent.kind === ts.SyntaxKind.ExportAssignment) {
            const propertyAssignment = properties.filter(
              (property) => property.kind === ts.SyntaxKind.PropertyAssignment
            );
            if (propertyAssignment?.length > 0) {
              const entryInfo = getObject(propertyAssignment);
              entryObj = entryInfo;
            }
          }
          break;
      }
      if (node.getChildCount() > 0) {
        ts.forEachChild(node, visit);
      }
    }

    visit(ast);

    return entryObj;
  }

  /**
   * 匹配I18N.xxx.xxx
   * @param {TextEditor} activeEditor vscode文档编辑器对象
   */
  matchI18NRegular(activeEditor: TextEditor) {
    const reg = /(I18N)(\.[a-zA-Z0-9_]{0,}){1,}[\s\},\)]/gm;
    const text = activeEditor.document.getText();
    const matchList = [...text.matchAll(reg)];
    const decorationOptions: DecorationOptions[] = [];

    matchList.forEach(async (match: any) => {
      const position = this.generatePositionInfo(activeEditor, match);
      const str: string = match[0];
      const strPath: string = str.replace(/[\s\},\)]/, "");

      const contentText = `'${get(this.i18nConfiguration, strPath)}'`;
      let decorationArr = [];

      if (typeof contentText === "object") {
        decorationArr = this.matchI18NVariable(activeEditor, strPath);
      }
      decorationOptions.push(
        this.generateDecorations(position.range, contentText as string)
      );
      decorationOptions.push(...decorationArr);
    });
    this.decorations = decorationOptions;
  }

  /**
   * 匹配I18N.xxx.xxx赋值的情况
   * @param {TextEditor} activeEditor vscode文档编辑器对象
   * @param {string} expressionPath I18N.xxx表达式
   */
  matchI18NVariable(activeEditor: TextEditor, expressionPath: string) {
    const decorationArr: any[] = [];
    const text = activeEditor.document.getText();
    const startPos = activeEditor.document.positionAt(
      text.indexOf(expressionPath)
    );
    const textLine = activeEditor.document.lineAt(startPos);
    const textLineInfoArr = textLine.text.trim().split(" ");
    const regStr = textLineInfoArr[1] + "\\.{1,}[a-zA-Z0-9_.]{1,}";
    const reg = new RegExp(regStr, "g");
    const matchList = [...text.matchAll(reg)];

    matchList.forEach((item) => {
      const i18nExpressionPath = item[0].replace(
        textLineInfoArr[1],
        expressionPath
      );
      const positionItem = this.generatePositionInfo(activeEditor, item!);
      const range = positionItem.range;

      decorationArr.push(
        this.generateDecorations(
          range,
          get(this.i18nConfiguration, i18nExpressionPath) as string
        )
      );
    });
    return decorationArr;
  }

  /**
   * 应用装饰
   * @param {TextEditor} activeEditor vscode文档编辑器对象
   */
  applyDecorations(activeEditor: TextEditor): void {
    activeEditor.setDecorations(Global.decorationType, this.decorations);
  }

  /**
   * 中文替换i18n表达式
   * @param {TextEditor} activeEditor vscode文档编辑器对象
   */
  applyReplace(activeEditor: TextEditor): void {
    this.decorations.forEach((decoration) => {
      activeEditor.edit((editBuilder) => {
        editBuilder.replace(
          decoration.range,
          decoration.renderOptions?.after?.contentText!
        );
      });
    });
  }

  static setI18nConfiguration(obj: I18NFileType) {
    Handler.that.i18nConfiguration = obj;
  }
}
