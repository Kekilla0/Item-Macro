import { logger } from "./logger.js";
import { settings } from "./settings.js";
import * as dnd5e from "./systems/dnd5e.js";
import * as sfrpg from "./systems/sfrpg.js";
import * as swade from "./systems/swade.js";
import * as dungeonworld from "./systems/dungeonworld.js";
import * as ose from "./systems/ose.js";
import * as demonlord from "./systems/demonlord.js";
import * as cyberpunk from "./systems/cyberpunk-red-core.js";
import * as worldbuilding from "./systems/worldbuilding.js";

export class helper{
  static register(){
    logger.info(`Registering Helper Functions.`);
    helper.registerItem();
    helper.systemHandler();
  }

  static registerItem(){
    Item.prototype.hasMacro = function (){
      let flag = this.getFlag(settings.id, `macro`);

      logger.debug("Item | hasMacro | ", { flag });
      return !!(flag?.command ?? flag?.data?.command);
    }
	  
    Item.prototype.getMacro = function(){
      let hasMacro = this.hasMacro();
      let flag = this.getFlag(settings.id, `macro`);

      logger.debug("Item | getMacro | ", { hasMacro, flag });

      if(hasMacro) {
	const command = !!flag?.command;
        return new Macro( command ? flag : flag?.data );
      }
	    
      return new Macro({ img : this.img, name : this.name, scope : "global", type : "script", });
    }

    Item.prototype.setMacro = async function(macro){
      let flag = this.getFlag(settings.id, `macro`);

      logger.debug("Item | setMacro | ", { macro, flag });

      if(macro instanceof Macro){
        const data = macro.toObject();
        return await this.setFlag(settings.id, `macro`, data);
      }
    }

    Item.prototype.executeMacro = function(...args){
      if(!this.hasMacro()) return;
      const type = settings.isV10 ? this.getMacro()?.type : this.getMacro()?.data.type;
      switch(type){
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
      
      /* MMH@TODO Check the types returned by linked and unlinked */
			//const token = item.actor?.token?.object ?? canvas.tokens.get(speaker.token); //v9 version
      const token = canvas.tokens.get(speaker.token); //v10 branch version (verify operation)
      const character = game.user.character;
      const event = getEvent();

      logger.debug("Item | _executeScript | ", {macro, speaker, actor, token, character, item, event, args});

      //build script execution
      const body = `(async ()=>{
        ${ macro.command ?? macro?.data?.command }
      })();`;
      const fn = Function("item", "speaker", "actor", "token", "character", "event", "args", body);

      logger.debug("Item | _executeScript | ", { body, fn });

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
      case "worldbuilding" :
        if(settings.value("defaultmacro")) worldbuilding.register_helper();
        break;
    }
    if(sheetHooks){
      Object.entries(sheetHooks).forEach(([preKey, obj])=> {
        if(obj instanceof Object)
          Object.entries(obj).forEach(([key, str])=> {
            Hooks.on(`${preKey}${key}`, (app, html, data) => changeButtonExecution(app, html, str, sheetHooks.onChange));
          });
      });
    }

    async function changeButtonExecution(app, html, str, onChange = []){
      logger.debug("changeButtonExecution : ", { app, html, str });

      if(helper.getSheetHooks().rendered[app.constructor.name] !== undefined)
        await helper.waitFor(() => app.rendered);


      if(app && !app.isEditable) return;
      let itemImages = html.find(str);

      logger.debug("changeButtonExecution | ", { app, html, str, itemImages});
  
      for(let img of itemImages){
        img = $(img);
        let li = img.parents(".item");
        let id = li.attr("data-item-id") ?? img.attr("data-item-id");
        if(!id) return logger.debug("Id Error | ", img, li, id);
        
        let item = app.actor.items.get(id);

        logger.debug("changeButtonExecution | for | ", { img, li, id, item });
  
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

          onChange.forEach( fn => fn(img, item, html) );
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
      case "worldbuilding" :
        if(settings.value("charsheet")) return worldbuilding.sheetHooks();
        break;
    }
  }

  static addContext(contextOptions, origin){
    if(!game.user.isGM) return;
    logger.info("Adding Context Menu Items.");
    contextOptions.push({
      name : settings.i18n("context.label"),
      icon : '<i class="fas fa-redo"></i>',
      condition : () => game.user.isGM, 
      callback : li => updateMacros(origin, li?.data("entityId")),
    });

    async function updateMacros(origin, _id){
      logger.info("Update Macros Called | ", origin, _id); 
      let item = undefined, updateInfo = [];
      if(origin === "Directory") item = game.items.get(_id);
      //if(origin === "Compendium") /* No clue */
    
      let result = await Dialog.confirm({
        title : settings.i18n("context.confirm.title"),
        content : `${settings.i18n("context.confirm.content")} <br><table><tr><td> Name : <td> <td> ${item.name} </td></tr><tr><td> ID : <td><td> ${item.id} </td></tr><tr><td> Origin : <td> <td> Item ${origin} </td></tr></table>`,
      });
    
      let macro = item.getMacro();
      logger.debug("updateMacros Info | ", item, macro, result);
    
      if(result){
        //update game items
        for(let i of game.items.filter(e=> e.name === item.name && e.id !== item.id)){
          await updateItem({ item : i, macro , location : "Item Directory"});
        }
    
        //update actor items
        for(let a of game.actors){
          await updateActor({ actor : a, name : item.name, macro, location : `Actor Directory [${a.name}]`});
        }
        //update scene entities
        for(let s of game.scenes){
          for(let t of s.data.tokens.filter(e=> !e.actorLink)){
            let token = new Token(t, s);
            await updateActor({ actor : token.actor, name : item.name, macro, location : `Scene [${s.name}] Token [${t.name}]`});
          }
        }
    
        await Dialog.prompt({
          title : settings.i18n("context.prompt.title"),
          content : `${settings.i18n("context.prompt.content")}<hr>${updateInfo.reduce((a,v)=> a+=`<table><tr><td> Actor : <td> <td> ${v.actor} </td></tr><tr><td> Token : <td> <td> ${v.token} </td></tr><tr><td> Item : <td> <td> ${v.item} </td></tr><tr><td> Location : <td> <td> ${v.location} </td></tr></table>`, ``)}`,
          callback : () => {},
          options : { width : "auto", height : "auto" },
        });
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
