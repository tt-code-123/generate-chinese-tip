import { commands, ExtensionContext } from "vscode";
import { Handler } from "./handler";
import { CommandId } from "./types";

/**
 * Register all commands contributed by this extension.
 */
export function registerAllCommands(extensionContext: ExtensionContext) {
  const disposableToggleErrorLens = commands.registerCommand(
    CommandId.regenerateI18N,
    async () => {
      await Handler.initI18nFileObj();
    }
  );

  extensionContext.subscriptions.push(disposableToggleErrorLens);
}
