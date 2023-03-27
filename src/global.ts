import { TextEditorDecorationType } from "vscode";

export class Global {
  static decorationType: TextEditorDecorationType;

  static setDecorationType(decorationType: TextEditorDecorationType) {
    Global.decorationType = decorationType;
  }
}
