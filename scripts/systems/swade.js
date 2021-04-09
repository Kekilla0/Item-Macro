import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper()
{
  logger.info(`Registering DND5E Helpers`);
  /*
    Override System Default
  */
  game.swade.rollWeaponMacro = (weaponName) => {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if (speaker.token)
        actor = game.actors.tokens[speaker.token];
    if (!actor)
        actor = game.actors.get(speaker.actor);
    const item = actor
        ? actor.items.find((i) => i.name === weaponName)
        : null;
    if (!item)
        return ui.notifications.warn(`Your controlled Actor does not have an item named ${weaponName}`);
    
    if(item.hasMacro() && settings.value("defaultmacro"))
      return item.executeMacro();
    return item.rollDamage();
  }

}

export function sheetHooks()
{
  const renderSheets = {    
    CharacterSheet : ".item-img", 
    NPCSheet : ".item-img",
  };
  const renderedSheets = {

  };

  return { render : renderSheets, rendered : renderedSheets };
}


