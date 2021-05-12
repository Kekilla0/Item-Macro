import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper()
{
  logger.info(`Registering DND5E Helpers`);
  /*
    Override System Default
  */
  game.ose.rollItemMacro = (itemName) => {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if ( speaker.token ) actor = game.actors.tokens[speaker.token];
    if ( !actor ) actor = game.actors.get(speaker.actor);
  
    // Get matching items
    const items = actor ? actor.items.filter(i => i.name === itemName) : [];
    if ( items.length > 1 ) {
      ui.notifications.warn(`Your controlled Actor ${actor.name} has more than one Item with name ${itemName}. The first matched item will be chosen.`);
    } else if ( items.length === 0 ) {
      return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`);
    }
    const item = items[0];
  
    // Trigger the item roll
    if(item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();
    return item.roll();
  }

}

export function sheetHooks()
{
  const renderSheets = {    
    OseActorSheetCharacter : ".item-image", 
    OseActorSheetMonster : ".item-image",
  };
  const renderedSheets = {

  };

  return { render : renderSheets, rendered : renderedSheets };
}


