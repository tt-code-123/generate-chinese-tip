import * as vscode from "vscode";
import { SETTING_PREFIX } from "./const";

export class Configuration {
  private configInfo: Contributions;
  private i18nFileObj: I18NFileType = {};

  constructor() {
    this.configInfo = vscode.workspace
      .getConfiguration()
      .get(SETTING_PREFIX) as Contributions;
  }

  async initI18nFileObj() {
    const rootPath = this.getRootPath();
    const langsPath: string = `${rootPath}/src/i18n/langs`;
    if (rootPath) {
      const obj: I18NFileType = {};
      const res = await vscode.workspace.fs.readDirectory(
        vscode.Uri.file(langsPath)
      );
      const directoryArr = res.filter(
        (item) => item[1] === vscode.FileType.Directory
      );

      for (let index = 0; index < directoryArr.length; index++) {
        const path = directoryArr[index][0];
        obj[path] = await this.recursionReadDirectory(`${langsPath}/${path}`);
      }

      this.i18nFileObj = {
        ["I18N"]: obj,
      };
    }
  }

  async recursionReadDirectory(path: string): Promise<I18NFileType> {
    const obj: I18NFileType = {};
    const initPath = vscode.Uri.file(path);
    const res = await vscode.workspace.fs.readDirectory(initPath);
    const directoryArr = res.filter(
      (item) => item[1] === vscode.FileType.Directory
    );

    if (directoryArr.length === 0) {
      const contentObj: I18NFileType = {};
      const fileContentBuffer = await vscode.workspace.fs.readFile(
        vscode.Uri.file(`${path}/index.ts`)
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
            contentObj[str[0]] = str[1].replace(/"/g, "").trim();
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
        const humpPath = this.formateStrToHump(pathAddress);
        obj[humpPath] = await this.recursionReadDirectory(
          `${path}/${pathAddress}`
        );
      }
    }

    return obj;
  }

  formateStrToHump(str: string): string {
    let newStr = str;
    if (newStr.search(/-/g) !== -1) {
      for (let index = 0; index < str.length; index++) {
        if (str[index].search(/-/g) !== -1) {
          newStr = newStr.replace(
            `-${str[index + 1]}`,
            `${str[index + 1].toUpperCase()}`
          );
        }
      }
    }
    return newStr;
  }

  getRootPath(): string {
    return vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || "";
  }

  getConfigInfo() {
    return this.configInfo;
  }

  getI18nFileObj() {
    return this.i18nFileObj;
  }
}
