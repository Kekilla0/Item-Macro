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
  _onEditImage(event){
    logger.debug("ItemMacroConfig.js | _onEditImage  | ", {event});
    return ui.notifications.error(settings.i18n("error.editImage"));
  }

  /*
    Override
  */
  async _updateObject(event,formData){
    logger.debug("ItemMacroConfig.js | _updateObject  | ", {event, formData});
    await this.updateMacro(mergeObject(formData, { type : "script", }));
  }

  /*
    Override
  */
  async _onExecute(event){
    event.preventDefault();
    let item = this.options.item;
    let command = this._element[0].querySelectorAll('textarea')[0].value;
    let type = this._element[0].querySelectorAll('select')[1].value;

    logger.debug("ItemMacroConfig.js | _onExecute  | ", {event, item, command, type});

    await this.updateMacro({ command, type ,});
    item.executeMacro(event);
  }

  async updateMacro({ command, type }){
    let item = this.options.item;
    let macro = item.getMacro();

    logger.debug("ItemMacroConfig.js | updateMacro  | ", {command, type, item, macro});

    if(macro.command != command)
      await item.setMacro(new Macro({
        name : item.name, 
        type, 
        scope : "global", 
        command, 
        author : game.user.id,
      }));
  }


  static _init(app, html, data){
    logger.debug("ItemMacroConfig.js | _init  | ", {app, html, data});

    if((settings.value("visibilty") && app.object.isOwner) || game.user.isGM){
      let openButton = $(`<a class="open-itemacro" title="itemacro"><i class="fas fa-sd-card"></i>${settings.value("icon") ? "" : "Item Macro"}</a>`);
      openButton.click(async (event) => {
          let Macro = null;
          let Item = await fromUuid(app.document.uuid);

          for (let key in app.document.apps) {
              let obj = app.document.apps[key];
              if (obj instanceof ItemMacroConfig) {
                  Macro = obj;
                  break;
              }
          }
          if(!Macro) 
            Macro = new ItemMacroConfig(Item.getMacro(), { item : Item });
          Macro.render(true);

          logger.debug("ItemMacroConfig.js | _init click  | ", {event, Macro, Item});
      });
      html.closest('.app').find('.open-itemacro').remove();
      let titleElement = html.closest('.app').find('.window-title');
      openButton.insertAfter(titleElement);
    }
  }
}