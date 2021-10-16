import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper()
{
  logger.info(`Registering DemonLord Helpers`);
  /*
    Override
  */
  game.demonlord.rollItemMacro = (itemName) => {
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
    DLCharacterSheet : ".rollable, .attack-roll, .talent-roll, .magic-roll",
    DLCreatureSheet  : ".rollable, .attack-roll, .talent-roll, .magic-roll",
  };
  const renderedSheets = {

  };

  return { render : renderSheets, rendered : renderedSheets };
}


