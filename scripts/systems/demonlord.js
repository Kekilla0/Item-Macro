import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper()
{
  logger.info(`Registering DemonLord Helpers`);
  /*
    Override
  */
  game.demonlord.rollWeaponMacro = (itemName) => {
		const speaker = ChatMessage.getSpeaker()
		let actor = null;
		if (speaker.token) actor = game.actors.tokens[speaker.token];
		if (!actor) actor = game.actors.get(speaker.actor);
		const item = actor ? actor.items.find(i => i.name === itemName) : null;
		if (!item) {
			return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)
		}
		if(item.hasMacro() && settings.value("defaultmacro"))
			return item.executeMacro();
		return actor.rollWeaponAttack(item.id)
  }

	game.demonlord.rollTalentMacro = (itemName, state) => {
		const speaker = ChatMessage.getSpeaker()
		let actor
		if (speaker.token) actor = game.actors.tokens[speaker.token]
		if (!actor) actor = game.actors.get(speaker.actor)
		const item = actor ? actor.items.find(i => i.name === itemName) : null
		if (!item) {
			return ui.notifications.warn(`Your controlled Actor does not have an item named ${itemName}`)
		}
	
		if(item.hasMacro() && settings.value("defaultmacro"))
			return item.executeMacro();
		else {
			switch (state) {
				case 'true':
					actor.rollTalent(item.id)
					break
		
				case 'false':
					item.data.data.uses.value = 0;
					item.data.data.addtonextroll = false;
					actor.updateEmbeddedDocuments('Item', item.data);
					break
		
				case '':
					item.data.data.addtonextroll = !item.data.data.addtonextroll;
					actor.updateEmbeddedDocuments('Item', item.data);
		
					if (item.data.data.addtonextroll) actor.rollTalent(item.id);
					break;
		
				default:
					actor.rollTalent(item.id)
					break;
			}
		}
	}

	game.demonlord.rollSpellMacro = (itemName) => {
		const speaker = ChatMessage.getSpeaker();
		let actor = null;
		if (speaker.token) actor = game.actors.tokens[speaker.token];
		if (!actor) actor = game.actors.get(speaker.actor);
		const item = actor ? actor.items.find(i => i.name === itemName) : null;
		if (!item) {
			return ui.notifications.warn(`Your controlled Actor does not have an ;item named ${itemName}`)
		}
		if(item.hasMacro() && settings.value("defaultmacro"))
			return item.executeMacro();
		return actor.rollSpell(item.id);
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