import { logger } from "./logger.js";
import { settings } from "./settings.js";
import * as dnd5e from "./systems/dnd5e.js";
import * as sfrpg from "./systems/sfrpg.js";
import * as swade from "./systems/swade.js";

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
  /*
    ...spread operators must be last argument
  */
  Item.prototype.executeMacro = function( ...args){
    if(this.hasMacro())
    {
      const macro = this.getMacro();
      const speaker = ChatMessage.getSpeaker();
      const actor = game.actors.get(speaker.actor);
      const token = canvas.tokens.get(speaker.token);
      const character = game.user.character;
      const item = this;
      const event = args[0] instanceof MouseEvent ? args.shift() : {};
      
      //logger.debug(macro, speaker, actor, token, character, item);
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
  }

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
    if(app && !app.isEditable) return;
    let itemImages = html.find(str);

    for(let img of itemImages)
    {
      let li = $(img).parents(".item");
      let id = li.attr("data-item-id") ?? $(img).attr("data-item-id");
      if(!id) return;
      
      let item = app.actor.getOwnedItem(id);
      img = $(img);

      if(item.hasMacro())
      {
        if(settings.value("click"))
        {
          img.contextmenu((event) => { item.executeMacro({ event }, []); })
        }else{
          img.off();
          img.click((event)=> { item.executeMacro({ event }, []); });
        }
      }
    }
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
  let item = actor.getOwnedItem(_itemID);
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