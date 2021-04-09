import { settings } from "./settings.js";

export class logger {
  static name = "Item Macro";
  static key = "itemacro";

  static info(...args) {
    console.log(`${this.name} | `, ...args);
  }

  static debug(...args) {
    if (settings.value('debug'))
      this.info("DEBUG | ", ...args);
  }

  static error(...args){
    this.info("ERROR | ", ...args);
    ui.notifications.error(`Error `, ...args);
  }
}