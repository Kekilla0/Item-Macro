import {logger} from './logger.js';
import {settings} from './settings.js';
import {ItemMacroConfig} from './ItemMacroConfig.js';
import * as helper from './helper.js';

//CONFIG.debug.hooks = true;
logger.info("Initializing Module.");
/*
  Hooks
*/
Hooks.on('init', settings.register );
Hooks.on('ready', helper.register );
Hooks.on('renderItemSheet', ItemMacroConfig._init );
Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(html, contextOptions, "Directory"));
//Hooks.on('getCompendiumDirectoryEntryContext', helper.addContext);

/*
  Known Issues : 
    Favorites Tab for Tidy 5e Sheets does not work

  Ideas :
    add context menu for compendium
    add checks for if the item that is being editted is in a compendium (unlock?)
*/