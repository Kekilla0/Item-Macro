import { logger } from "./logger.js";
import { i18n } from "./helper.js";

export class settings{
  static name = "Item Macro";
  static key = "itemacro";

  
  static value(str){
    return game.settings.get(this.key, str);
  }
  

  static register(){
    logger.info(`Registering All Settings.`);
    settings.register_logger();
    settings.register_defaultmacro();
    settings.register_sheet();
    settings.register_permission();
    settings.register_icon();
    settings.register_click();
  }

  static register_logger(){
    game.settings.register(
      this.key,
      'debug',
      {
        name : i18n("settings.debug.title"),
        hint : i18n("settings.debug.hint"),
        scope : "client",
        config : true,
        default : false,
        type : Boolean
      } 
    );
  }
  static register_defaultmacro(){
    game.settings.register(
      this.key,
      'defaultmacro',
      {
        name : i18n("settings.defaultmacro.title"),
        hint : i18n("settings.defaultmacro.hint"),
        scope : "world",
        config : true,
        default : false,
        type : Boolean,
        onChange : () => window.location.reload(),
      } 
    );
  }
  static register_sheet(){
    game.settings.register(
      this.key,
      'charsheet',
      {
        name : i18n("settings.charsheet.title"),
        hint : i18n("settings.charsheet.hint"),
        scope : "world",
        config : true,
        default : false,
        type : Boolean,
        onChange : () => window.location.reload(),
      } 
    );
  }
  static register_permission(){
    game.settings.register(
      this.key,
      'visibilty',
      {
        name : i18n("settings.visibilty.title"),
        hint : i18n("settings.visibilty.hint"),
        scope : "world",
        config : true,
        default : false,
        type : Boolean
      } 
    );
  }
  static register_icon(){
    game.settings.register(
      this.key,
      'icon',
      {
        name : i18n("settings.icon.title"),
        hint : i18n("settings.icon.hint"),
        scope : "world",
        config : true,
        default : false,
        type : Boolean
      } 
    );
  }
  static register_click(){
    game.settings.register(
      this.key,
      'click',
      {
        name : i18n("settings.click.title"),
        hint : i18n("settings.click.hint"),
        scope : "client",
        config : true,
        default : false,
        type : Boolean,
        onChange : () => window.location.reload(),
      } 
    );
  }
}