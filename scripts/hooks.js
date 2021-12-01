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
    !add capability to update all items via a specific item in a compendium
      ?requires update to foundry core code, issue sent

  TODO Ideas :
    add checks for if the item that is being editted is in a compendium (unlock?)
    add system CyberPunk RED
    add capability to update all items via a compendium

  Update Notes :
    Fix to settings not correctly saving upon exit
    Fix for Tidy5e sheet support
    Integrated Shadow of the Demonlord (w/ help from @patrickporto#9260)
*/