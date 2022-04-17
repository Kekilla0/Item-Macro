import { logger } from "../logger.js";
import { settings } from "../settings.js";

export function register_helper()
{
  logger.info(`Registering Simple World Building Helpers`);
  /*
    Override
  */

  //???
}

export function sheetHooks()
{
  const renderSheets = {
    SimpleActorSheet : ".item.flexrow img",
  };
  const renderedSheets = {
  };

  return { render : renderSheets, rendered : renderedSheets };
}


