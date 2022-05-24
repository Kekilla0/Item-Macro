import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper(){
  logger.info(`Registering Simple World Building Helpers`);
  logger.info(`Registering hotbardrop.`);
  Hooks._hooks.hotbarDrop = [
    async (bar, data, slot) => {
      logger.debug("HotbarDrop | ", { bar, data, slot, event});

      if(data.type !== "Item") return true;

      let id = getId();
      let item = await fromUuid(id);
      let name = getName();
      let macro = await getMacro();

      logger.debug("HotbarDrop | ", { id, item, name, macro });

      if(!id || !macro) return true;
      game.user.assignHotbarMacro(macro,slot);
      return false;

      function getId(){
        if(!!data.sceneId){
          return game.scenes.get(data.sceneId).tokens.get(data.tokenId).actor.items.get(data.data._id).uuid;
        }
        if(!!data.actorId){
          return game.actors.get(data.actorId).items.get(data.data._id).uuid;
        }
        if(!!data.id){
          return game.items.get(data.id).uuid;
        }
        return false;
      }
      function getName(){
        if(!item.actor) return item.name;
        else return `${item.actor.name} | ${item.name}`;
      }
      async function getMacro(){
        let macro = game.macros.find(m => m.command == getCommand());
        return macro ?? await Macro.create({ name, type : "script", img : item.img, command : getCommand()}, { displaySheet : false });
      }
      function getCommand(){
        return `let item = await fromUuid("${id}");\nif(item instanceof Item && item.hasMacro()) return item.executeMacro(event);`;
      }
    }
  ].concat(Hooks._hooks.hotbarDrop || []);
}

export function sheetHooks(){
  const renderSheets = {
    SimpleActorSheet : ".item.flexrow img",
  };
  const renderedSheets = {
  };

  return { render : renderSheets, rendered : renderedSheets };
}


