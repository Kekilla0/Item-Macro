import { logger } from "./logger.js";

export class settings{  
  static value(str){
    return game.settings.get(settings.data.name, str);
  }
  static i18n(key){
    return game.i18n.localize(key);
  }
  static register_module(key){
    settings.data = game.modules.get(key)?.data;
    if(!settings.data) return logger.error("Module Registration Error | Data Error | ", key);
  }

  static register(){
    settings.register_module("itemacro");
    logger.info(`Registering All Settings.`);
    settings.register_settings();
  }

  static reload(){
    setTimeout(() => window.location.reload(), 500);
  }

  static register_settings(){
    const settingData = {
      debug : {
        scope : "client", config : true, default : false, type : Boolean
      },
      defaultmacro : {
        scope : "world", config : true, default : false, type : Boolean, onChange :  () => settings.reload(),
      },
      charsheet : {
        scope : "world", config : true, default : false, type : Boolean, onChange :  () => settings.reload(),
      },
      visibilty : {
        scope : "world", config : true, default : false, type : Boolean
      },
      icon : {
        scope : "world", config : true, default : false, type : Boolean
      },
      click : {
        scope : "world", config : true, default : false, type : Boolean, onChange :  ()=> settings.reload(),
      },
    };


    Object.entries(settingData).forEach(([key, data])=> {
      game.settings.register(
        settings.data.name, key, {
          name : settings.i18n(`settings.${key}.title`),
          hint : settings.i18n(`settings.${key}.hint`),
          ...data
        }
      );
    })
  }
}