/* 定义的配置类型 */
export interface Contributions {
  enabled: boolean;
  style: {
    fontWeight: string;
    color: string;
    backgroundColor: string;
    underline: boolean;
    italic: boolean;
  };
  enabledTranslateFiles: string[];
}

/* 读取i18n文件路径类型 */
export interface I18NFileType {
  [key: string]: I18NFileType | string;
}

/* 命令id */
export const enum CommandId {
  regenerateI18N = "generateChineseTip.regenerateI18N",
}
