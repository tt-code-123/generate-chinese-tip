import * as vscode from "vscode";

/* 获取项目根路径 */
export const getRootPath: () => string = () => {
  return vscode.workspace.workspaceFolders?.[0]?.uri?.fsPath || "";
};

/* 格式化字符串为驼峰命名 reset-password => resetPassword */
export const formateStrToHump: (params: string) => string = (str) => {
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
};
