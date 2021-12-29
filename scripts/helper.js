import { logger } from "./logger.js";
import { settings } from "./settings.js";
import * as dnd5e from "./systems/dnd5e.js";
import * as sfrpg from "./systems/sfrpg.js";
import * as swade from "./systems/swade.js";
import * as dungeonworld from "./systems/dungeonworld.js";
import * as ose from "./systems/ose.js";
import * as demonlord from "./systems/demonlord.js";
import * as cyberpunk from "./systems/cyberpunk-red-core.js";

export class helper{
  static register(){
    logger.info(`Registering Helper Functions.`);
    helper.registerItem();
    helper.systemHandler();
  }

  static registerItem(){
    Item.prototype.hasMacro = function (){
      return !!this.getFlag(settings.data.name, `macro`)?.data?.command;
    }
    Item.prototype.getMacro = function(){
      if(this.hasMacro())
        return new Macro(this.getFlag(settings.data.name, `macro`).data);
    }
    Item.prototype.setMacro = async function(macro){
      if(macro instanceof Macro){
        await this.unsetFlag(settings.data.name,`macro`);
        return await this.setFlag(settings.data.name, `macro`, { data :  macro.data });
      }
    }
    Item.prototype.executeMacro = function(...args){
      if(!this.hasMacro()) return;

      switch(this.getMacro().data.type){
        case "chat" :
          //left open if chat macros ever become a thing you would want to do inside an item?
          break;
        case "script" :
          return this._executeScript(...args);
      }
    }
    Item.prototype._executeScript = function(...args){
      //add variable to the evaluation of the script
      const item = this;
      const macro = item.getMacro();
      const speaker = ChatMessage.getSpeaker({actor : item.actor});
      const actor = item.actor ?? game.actors.get(speaker.actor);
      const token = item.actor?.token ?? canvas.tokens.get(speaker.token);
      const character = game.user.character;
      const event = getEvent();

      logger.debug("Execute Script Data | ", {macro, speaker, actor, token, character, item, event, args, [`this`] : this});

      //build script execution
      const body = `(async ()=>{
        ${macro.data.command}
      })();`;
      const fn = Function("item", "speaker", "actor", "token", "character", "event", "args", body);

      //attempt script execution
      try {
        fn.call(macro, item, speaker, actor, token, character, event, args);
      }catch(err){
        ui.notifications.error(settings.i18n("error.macroExecution"));
        logger.error(err);
      }

      function getEvent(){
        let a = args[0];
        if(a instanceof Event) return args[0].shift();
        if(a?.originalEvent instanceof Event) return args.shift().originalEvent;
        return undefined;
      }
    }
  }

  static systemHandler(){
    let sheetHooks = helper.getSheetHooks();

    switch(game.system.id) {
      case "dnd5e" :
        if(settings.value("defaultmacro")) dnd5e.register_helper();
        break;
      case "sfrpg" :
        if(settings.value("defaultmacro")) sfrpg.register_helper();
        break;
      case "swade" :
        if(settings.value("defaultmacro")) swade.register_helper();
        break;
      case "dungeonworld" :
        if(settings.value("defaultmacro")) dungeonworld.register_helper();
        break;
      case "ose" :
        if(settings.value("defaultmacro")) ose.register_helper();
        break;
      case "demonlord" :
        if(settings.value("defaultmacro")) demonlord.register_helper();
        break;
      case "cyberpunk-red-core" :
        if(settings.value("defaultmacro")) cyberpunk.register_helper();
        break;
    }
    if(sheetHooks){
      Object.entries(sheetHooks).forEach(([preKey, obj])=> {
        if(obj instanceof Object)
          Object.entries(obj).forEach(([key, str])=> {
            Hooks.on(`${preKey}${key}`, (app, html, data) => changeButtonExecution(app, html, str));
          });
      });
    }

    async function changeButtonExecution(app, html, str){
      logger.debug("changeButtonExecution : ", { app, html, str });

      if(helper.getSheetHooks().rendered[app.constructor.name] !== undefined)
        await helper.waitFor(() => app.rendered);


      if(app && !app.isEditable) return;
      let itemImages = html.find(str);
  
      for(let img of itemImages){
        img = $(img);
        let li = img.parents(".item");
        let id = li.attr("data-item-id") ?? img.attr("data-item-id");
        if(!id) return logger.debug("Id Error | ", img, li, id);
        
        let item = app.actor.items.get(id);
  
        if(item.hasMacro()){
          if(settings.value("click")){
            img.contextmenu((event) => { item.executeMacro(event); })
          }else{
            img.off();
            img.click((event)=> { 
              logger.debug("Img Click | ", img, event);
              item.executeMacro(event); 
            });
          }
        }
      }
    }
  }

  static getSheetHooks(){
    switch(game.system.id) {
      case "dnd5e" :
        if(settings.value("charsheet")) return dnd5e.sheetHooks();
        break;
      case "sfrpg" :
        if(settings.value("charsheet")) return sfrpg.sheetHooks();
        break;
      case "swade" :
        if(settings.value("charsheet")) return swade.sheetHooks();
        break;
      case "dungeonworld" :
        if(settings.value("charsheet")) return dungeonworld.sheetHooks();
        break;
      case "ose" :
        if(settings.value("charsheet")) return ose.sheetHooks();
        break;
      case "demonlord" :
        if(settings.value("charsheet")) return demonlord.sheetHooks();
        break;
      case "cyberpunk-red-core" :
        if(settings.value("charsheet")) return cyberpunk.sheetHooks();
        break;
    }
  }

  static addContext(contextOptions, origin){
    if(!game.user.isGM) return;
    logger.info("Adding Context Menu Items.", {contextOptions, origin});

    if(origin == "ItemDirectory")
      contextOptions.push({
        name : settings.i18n("context.label"),
        icon : '<i class="fas fa-redo"></i>',
        condition : () => game.user.isGM, 
        callback : li => updateMacros(origin, li?.data("documentId")),
      });
    
    if(origin == "CompendiumDirectory")
      contextOptions.push({
        name : settings.i18n("context.label"),
        icon : '<i class="fas fa-redo"></i>',
        condition : (li) => game.user.isGM && (game.packs.get(li?.data("pack")).metadata.type == "Item" ?? false), 
        callback : li => updateMacros(origin, li?.data("pack")),
      });

    if(origin == "CompendiumEntry")
    contextOptions.push({
      name : settings.i18n("context.label"),
      icon : '<i class="fas fa-redo"></i>',
      condition : (li) => game.user.isGM && (game.packs.get(getCompendium(li?.data("documentId")))?.metadata.type === "Item"), 
      callback : li => updateMacros(origin, li?.data("documentId")),
    });

    async function updateMacros(origin, _id){
      logger.info("Update Macros Called | ", origin, _id); 
      let items = [], updateInfo = [];
      if(origin === "ItemDirectory") items.push(game.items.get(_id));
      if(origin == "CompendiumEntry") items.push(await game.packs.get(getCompendium(_id)).getDocument(_id));
      if(origin === "CompendiumDirectory") items.push(...await game.packs.get(_id).getDocuments());

      if(item == []) return logger.error(`Item ID Error`);

      logger.debug("updateMacros Data | ", {origin, _id, items, updateInfo});

      let result = false, repeatedDialog = true;

      if(item.length > 1)
        repeatedDialog = await Dialog.confirm({
          title : "Updating from Compendium",
          content : `Would you like a prompt for each item (${items.length} items in ${_id})?`
        });
      
    

    
      for(let item in items){
        if(!item.hasMacro()) continue;

        if(repeatedDialog)
          result = await Dialog.confirm({
            title : settings.i18n("context.confirm.title"),
            content : `${settings.i18n("context.confirm.content")} <br><table><tr><td> Name : <td> <td> ${item.name} </td></tr><tr><td> ID : <td><td> ${item.id} </td></tr><tr><td> Origin : <td> <td> Item in ${origin} </td></tr></table>`,
          });

        if(result){
          result = false;
          let macro = item.getMacro();

          logger.debug("updateMacros Data | ", {repeatedDialong, result, origin, _id, item, updateInfo ,macro});

          updateDirectory(item, macro);
          updateActors(item, macro);
          updateTokens(item, macro);
        }
      }
    
      async function updateActor({ actor, name, macro, location}){
        logger.debug("Attempting Actor Update | ", actor, name, macro);
        for(let item of actor?.items?.filter(i=> i.data.name === name) || [])
          await updateItem({ item, macro, location });      
      }
      async function updateItem({ item, macro, location }){
        logger.debug("Attempting Item Update | ", item, macro);
        await item.setMacro(macro);
        updateInfo.push({
          actor     : item?.actor.id,
          token     : item?.actor?.token?.id,
          item      : item.id,
          location 
        });
      }
    }

    function getCompendium(_id){
      return Array.from(game.packs).reduce((a,b) => a || (b.index.get(_id) !== undefined ? b.collection : false), false);
    }
  }

  static async waitFor(fn, m = 200, w = 100, i = 0){
    while(!fn(i, ((i*w)/100)) && i < m){
      i++;
      await helper.wait(w);
    }
    return i === m ? false : true;
  }

  static async wait(ms){
    return new Promise((resolve)=> setTimeout(resolve, ms))
  }
}