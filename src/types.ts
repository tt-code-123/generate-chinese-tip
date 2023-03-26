/* 定义的配置类型 */
interface Contributions {
  enabled: boolean
  style: {
    fontSize: string
    fontWeight: string
    color: string
    backgroundColor: string
    underline: boolean
    italic: boolean
  }
  enabledTranslateFiles: string[]
}
