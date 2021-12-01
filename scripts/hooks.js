import { settings } from './settings.js';
import { helper } from './helper.js';
import { ItemMacroConfig } from './ItemMacroConfig.js';

Hooks.on('init', settings.register );
Hooks.on('ready', helper.register );
Hooks.on('renderItemSheet', ItemMacroConfig._init );
Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "Directory"));

/*
  Known Issues : 
    Tidy 5e Sheets right click.

  Fixes :
    add context menu for compendium 
      !requires update to foundry core code, issue sent


  Ideas :
    add checks for if the item that is being editted is in a compendium (unlock?)
    add system CyberPunk RED
*/