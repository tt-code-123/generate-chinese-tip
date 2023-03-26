import * as vscode from 'vscode'
import { SETTING_PREFIX } from './const'

export class Configuration {
  private configInfo: Contributions

  constructor() {
    this.configInfo = vscode.workspace
      .getConfiguration()
      .get(SETTING_PREFIX) as Contributions
  }

  getConfigInfo() {
    return this.configInfo
  }
}
