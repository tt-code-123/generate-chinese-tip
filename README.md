# generate-chinese-tip README
功能
1. I18N.xxx.xxx表达式旁边展示其对应的中文。
2. I18N.xxx.xxx表达式替换为对应的中文。

使用
1. 需要在src目录下配置i18n文件。结构如下：

   ```
   /* 其中langs下面的为应用支持的语言 */
   |-- i18n
       |-- langs
   			|-- zh-CN		
   			|-- en-US
   			|-- vi-VN
   			|-- th-TH
   ```

配置项

| 名称                  | 描述         | 取值                                                         |
| --------------------- | ------------ | ------------------------------------------------------------ |
| enabled               | 是否进行翻译 | true\|false                                                  |
| style                 | 中文的样式   | {color:"rgba(153, 153, 153, 1)", underline:false, backgroundColor:"transparent", fontWeight:"normal", italic:false} |
| enabledTranslateFiles | 生效的文件   | ["javascript","typescript","javascriptreact","typescriptreact"] |
| mode                  | 切换模式     | TIP\|REPLACE                                                 |



