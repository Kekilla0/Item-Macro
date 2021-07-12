import { logger } from "./logger.js";
import { settings } from "./settings.js";

export class ItemMacroConfig extends MacroConfig{
  /*
    Override
  */
  static get defaultOptions(){
    return mergeObject(super.defaultOptions, {
      template : "modules/itemacro/templates/macro-config.html",
      classes : ["macro-sheet", "sheet"]
    });
  }

  /*
    Override
  */
  async getData(){
    const data = super.getData();
    data.command = this.object.getMacro()?.data?.command || "";
    return data;
  }

  /*
    Override
  */
  _onEditImage(event){
    return ui.notifications.error(settings.i18n("error.editImage"));
  }

  /*
    Override
  */
  async _updateObject(event,formData){
    await this.updateMacro(mergeObject(formData, {
      type : "script",
    }));
  }

  /*
    Override
  */
  async _onExecute(event){
    event.preventDefault();
    await this.updateMacro({
      command :  this._element[0].querySelectorAll('textarea')[0].value,
      type : this._element[0].querySelectorAll('select')[1].value,
    });
    this.object.executeMacro(event);
  }

  async updateMacro({ command, type }){
    await this.object.setMacro(new Macro({
      name : this.object.data.name, 
      type, 
      scope : "global", 
      command, 
      author : game.user.id,
    }));
  }


  static _init(app, html, data){
    logger.debug("App  | ", app);
    logger.debug("HTML | ", html);
    logger.debug("Data | ", data);

    if((settings.value("visibilty") && app.object.isOwner) || game.user.isGM){
      let openButton = $(`<a class="open-itemacro" title="itemacro"><i class="fas fa-sd-card"></i>${settings.value("icon") ? "" : "Item Macro"}</a>`);
      openButton.click(event => {
          let Macro = null;
          for (let key in app.document.apps) {
              let obj = app.document.apps[key];
              if (obj instanceof ItemMacroConfig) {
                  Macro = obj;
                  break;
              }
          }
          if(!Macro) Macro = new ItemMacroConfig(app.document,{});
          Macro.render(true);
      });
      html.closest('.app').find('.open-itemacro').remove();
      let titleElement = html.closest('.app').find('.window-title');
      openButton.insertAfter(titleElement);
    }
  }
}