import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper()
{
  logger.info(`Registering DungeonWorld Helpers`);
  /*
    Override
  */
  game.dungeonworld.rollItemMacro = (itemName) => {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token) actor = game.actors.tokens[speaker.token];
    if (!actor) actor = game.actors.get(speaker.actor);
    const item = actor ? actor.items.find(i => i.name === itemName) : null;
    if (!item) return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);  

    // Trigger the item roll
    if(item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();
    return item.roll();
  }
}

export function sheetHooks()
{
  const renderSheets = {    
    ActorSheet : ".item .rollable",
    //DwActorNpcSheet : ".item .item-avatar",
  };
  const renderedSheets = {

  };

  return { render : renderSheets, rendered : renderedSheets };
}


