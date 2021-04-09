import { i18n } from "./helper.js";
import { logger } from "./logger.js";
import { settings } from "./settings.js";

export class ItemMacroConfig extends MacroConfig{
  name = "Item Macro";
  key = "itemacro";
  scope = "macro";

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
    return ui.notifications.error(i18n("error.editImage"));
  }

  /*
    Override
  */
  async _updateObject(event,formData){
    await this.updateMacro(formData.command);
  }

  /*
    Override
  */
  async _onExecute(event){
    event.preventDefault();
    await this.updateMacro(this._element[0].querySelectorAll('textarea')[0].value);
    this.object.executeMacro({ event }, []);
  }

  async updateMacro(command){
    await this.object.unsetFlag(this.key, this.scope);
    await this.object.setFlag(this.key, this.scope, new Macro({
      name : this.object.data.name, type : "script", scope : "global", command, author : game.user.id,
    }));
  }


  static _init(app, html, data){
    if((settings.value("visibilty") && app.object.owner) || game.user.isGM){
      let openButton = $(`<a class="open-itemacro" title="itemacro"><i class="fas fa-sd-card"></i>${settings.value("icon") ? "" : "Item Macro"}</a>`);
      openButton.click( event => {
          let Macro = null;
          for (let key in app.entity.apps) {
              let obj = app.entity.apps[key];
              if (obj instanceof ItemMacroConfig) {
                  Macro = obj;
                  break;
              }
          }
          if(!Macro) Macro = new ItemMacroConfig(app.entity,{});
          Macro.render(true);
      });
      html.closest('.app').find('.open-itemacro').remove();
      let titleElement = html.closest('.app').find('.window-title');
      openButton.insertAfter(titleElement);
    }
  }
}