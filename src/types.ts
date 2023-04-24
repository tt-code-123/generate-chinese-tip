/* 模式枚举 */
export enum ModeEnum {
  TIP = "TIP",
  REPLACE = "REPLACE",
}

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
  mode: ModeEnum;
}

/* 读取i18n文件路径类型 */
export interface I18NFileType {
  [key: string]: any;
}

/* 命令id */
export const enum CommandId {
  regenerateI18N = "generateChineseTip.regenerateI18N",
}
