import { commands, ExtensionContext } from "vscode";
import { Handler } from "./handler";
import { CommandId } from "./types";
import { getRootPath } from "./utils";

/**
 * Register all commands contributed by this extension.
 */
export function registerAllCommands(extensionContext: ExtensionContext) {
  const disposableToggleErrorLens = commands.registerCommand(
    CommandId.regenerateI18N,
    async () => {
      const rootPath = getRootPath();
      if (rootPath) {
        const res = await Handler.initI18nFileObj(`${rootPath}/src/i18n/langs`);
        Handler.setI18nConfiguration({
          I18N: {
            ...res,
          },
        });
      }
    }
  );

  extensionContext.subscriptions.push(disposableToggleErrorLens);
}
