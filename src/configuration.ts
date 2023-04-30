import { workspace } from "vscode";
import { SETTING_PREFIX } from "./const";
import { Contributions } from "./types";

export class Configuration {
  private configInfo: Contributions;

  constructor() {
    this.configInfo = workspace
      .getConfiguration()
      .get(SETTING_PREFIX) as Contributions;
  }

  getConfigInfo() {
    return this.configInfo;
  }

  setConfigInfo(configInfo: Contributions) {
    this.configInfo = configInfo;
  }
}
