import { settings } from './settings.js';

export class logger {
  static info(...args) {
    console.log(`${settings?.data?.title || "" }  | `, ...args);
  }
  static debug(...args) {
    if (settings.value('debug'))
      this.info("DEBUG | ", ...args);
  }
  static error(...args) {
    console.error(`${settings?.data?.title || "" } | ERROR | `, ...args);
  }
}