import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper()
{
  logger.info(`Registering DND5E Helpers`);
  /*
    Override
  */
  game.dnd5e.rollItemMacro = (itemName) => {
    const speaker = ChatMessage.getSpeaker();
    let actor;
    if ( speaker.token ) actor = game.actors.tokens[speaker.token];
    if ( !actor ) actor = game.actors.get(speaker.actor);

    // Get matching items
    const items = actor ? actor.items.filter(i => i.name === itemName) : [];
    if ( items.length > 1 ) {
      ui.notifications.warn(`Your controlled Actor ${actor.name} has more than one Item with name ${itemName}. The first matched item will be chosen.`);
    } 
    if ( items.length === 0 ) {
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
    //Core
    ActorSheet5eCharacter: ".item .item-image",
    ActorSheet5eVehicle: ".item .item-image",
    ActorSheet5eNPC: ".item .item-image",
    //BetterNPC
    BetterNPCActor5eSheet: ".item .rollable",
    BetterNPCActor5eSheetDark: ".item .rollable",
    ActorSheet5eCharacterDark: ".item .item-image",
    //DarkSheet
    DarkSheet: ".item .item-image",
    ActorNPC5EDark: ".item .item-image",
    DynamicActorSheet5e: ".item .item-image",
    //DNDBeyond
    DNDBeyondCharacterSheet5e: ".item .item-name .item-image",
    //Tidy
    //Tidy5eSheet:  ".item .item-image",
    //Tidy5eNPC: ".item .item-image",
    //Monster Blocks
    MonsterBlock5e: ".item .item-name",
  };
  const renderedSheets = {
    Alt5eSheet : ".item .item-image", 
    Tidy5eSheet : ".item .item-image",
  };

  return { render : renderSheets, rendered : renderedSheets };
}


