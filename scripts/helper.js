import { logger } from "./logger.js";
import { settings } from "./settings.js";
import * as dnd5e from "./systems/dnd5e.js";
import * as sfrpg from "./systems/sfrpg.js";
import * as swade from "./systems/swade.js";
import * as dungeonworld from "./systems/dungeonworld.js";
import * as ose from "./systems/ose.js"

export function i18n(str)
{
  return game.i18n.localize(str);
}

export function register(){
  logger.info(`Registering Helper Functions.`);

  Item.prototype.hasMacro = function (){
    return !!this.getFlag(`itemacro`, `macro`)?.data?.command;
  }
  Item.prototype.getMacro = function(){
    if(this.hasMacro())
      return new Macro(this.getFlag(`itemacro`, `macro`).data);
  }
  Item.prototype.executeMacro = function(...args){
    if(this.hasMacro()){
      const item = this;
      const macro = item.getMacro();
      const speaker = ChatMessage.getSpeaker({actor : item.actor});
      const actor = item.actor ?? game.actors.get(speaker.actor);
      const token = item.actor?.token ?? canvas.tokens.get(speaker.token);
      const character = game.user.character;
      const event = args[0]?.originalEvent instanceof MouseEvent ? args.shift() : {};
      
      logger.debug(macro);
      logger.debug(speaker);
      logger.debug(actor);
      logger.debug(token);
      logger.debug(character);
      logger.debug(item);
      logger.debug(event);
      logger.debug(args);

      try{
        eval(macro.data.command);
      }catch(err){
        ui.notifications.error(`There was an error in your macro syntax. See the console (F12) for details`);
        console.error(err);
      }
    }
  }
  Item.prototype.setMacro = async function(macro){
    logger.debug(this, macro);
    if(macro instanceof Macro){
      await this.unsetFlag(`itemacro`,`macro`);
      return await this.setFlag(`itemacro`, `macro`, { data :  macro.data });
    }
  }

  /*
    System Handler
  */
  let sheetHooks = null;
  switch(game.system.id) {
    case "dnd5e" :
      if(settings.value("defaultmacro")) dnd5e.register_helper();
      if(settings.value("charsheet")) sheetHooks = dnd5e.sheetHooks();
      break;
    case "sfrpg" :
      if(settings.value("defaultmacro")) sfrpg.register_helper();
      if(settings.value("charsheet")) sheetHooks = sfrpg.sheetHooks();
      break;
    case "swade" :
      if(settings.value("defaultmacro")) swade.register_helper();
      if(settings.value("charsheet")) sheetHooks = swade.sheetHooks();
      break;
    case "dungeonworld" :
      if(settings.value("defaultmacro")) dungeonworld.register_helper();
      if(settings.value("charsheet")) sheetHooks = dungeonworld.sheetHooks();
      break;
    case "ose" :
      if(settings.value("defaultmacro")) ose.register_helper();
      if(settings.value("charsheet")) sheetHooks = ose.sheetHooks();
      break;
  }

  logger.debug("Sheet Hooks | ", sheetHooks);

  if(sheetHooks)
  {
    Object.entries(sheetHooks).forEach(([preKey, obj])=> {
      if(obj instanceof Object)
        Object.entries(obj).forEach(([key, str])=> {
          Hooks.on(`${preKey}${key}`, (app, html, data) => changeButtonExecution(app, html, str));
        });
    });
  }

  function changeButtonExecution(app, html, str){
    logger.debug("changeButtonExecution | ", app, html, str);
    if(app && !app.isEditable) return;
    let itemImages = html.find(str);

    for(let img of itemImages)
    {
      img = $(img);
      let li = img.parents(".item");
      let id = li.attr("data-item-id") ?? img.attr("data-item-id");
      if(!id) return logger.debug("Id Error | ", img, li, id);
      
      let item = app.actor.items.get(id);

      if(item.hasMacro())
      {
        if(settings.value("click"))
        {
          img.contextmenu((event) => { item.executeMacro(event); })
        }else{
          img.off();
          img.click((event)=> { item.executeMacro(event); });
        }
      }
    }
  }
}

export function addContext(html, contextOptions, origin){
  if(!game.user.isGM) return;
  logger.info("Adding Context Menu Items.");
  contextOptions.push({
    name : `Update World Item Macros`,
    icon : '<i class="fas fa-redo"></i>',
    condition : () => game.user.isGM, 
    callback : li => updateMacros(origin, li?.data("entityId")),
  });
}

async function updateMacros(origin, _id){
  logger.info("Update Macros Called | ", origin, _id); 
  let item = undefined, updateInfo = [];
  if(origin === "Directory") item = game.items.get(_id);
  //if(origin === "Compendium") /* No clue */

  let result = await Dialog.confirm({
    title : "Item Macro Overwrite Prompt",
    content : `Are you sure you want to overwrite all item's macros with <br>
    <table>
      <tr>
        <td> Name : <td> <td> ${item.name} </td>
      </tr>
      <tr>
        <td> ID : <td> <td> ${item.id} </td>
      </tr>
      <tr>
        <td> Origin : <td> <td> Item ${origin} </td>
      </tr>
    </table>`,
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
      title : "Item Macro Overwrite Info",
      content : `Item Macro Overwrite Complete<hr>
      ${updateInfo.reduce((a,v)=> a+=`
        <table>
          <tr>
            <td> Actor : <td> <td> ${v.actor} </td>
          </tr>
          <tr>
            <td> Token : <td> <td> ${v.token} </td>
          </tr>
          <tr>
            <td> Item : <td> <td> ${v.item} </td>
          </tr>
          <tr>
            <td> Location : <td> <td> ${v.location} </td>
          </tr>
        </table>
        <br>
      `, ``)}`,
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

/*
  Backwards compatability for older version of tokenactionhud
*/
window.ItemMacro = {
  runMacro, getActorItems, getTokenItems, hasMacro
}

export function runMacro(_actorID, _itemID) {
  let actor = game.actors.get(_actorID)
    ? game.actors.get(_actorID)
    : game.actors.tokens[`${_actorID}`];

  /*let actor = (canvas.tokens.controlled.length === 1 && canvas.tokens.controlled[0].actor._id === _actorID) 
    ? canvas.tokens.controlled[0].actor 
    : game.actors.get(_actorID);*/
  if(!actor) return ui.notifications.warn(`No actor by that ID.`);
  if(actor.permission != 3) return ui.notifications.warn(`No permission to use this actor.`);
  let item = actor.items.get(_itemID);
  if (!item) return ui.notifications.warn (`That actor does not own an item by that ID.`);

  item.executeMacro();
}

export function getTokenItems(_tokenID) {
  let actor = game.actors.tokens[_tokenID];
  if(!actor) actor = canvas.tokens.get(_tokenID).actor;
  return actor.items.filter(item => item.hasMacro());
}

export function getActorItems(_actorID) {
  let actor = game.actors.get(_actorID);
  return actor.items.filter(item => item.hasMacro());
}

export function hasMacro(item){
  return item.hasMacro();
}