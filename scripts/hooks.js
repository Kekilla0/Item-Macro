import { settings } from './settings.js';
import { helper } from './helper.js';
import { ItemMacroConfig } from './ItemMacroConfig.js';

Hooks.on('init', settings.register );
Hooks.on('ready', helper.register );
Hooks.on('renderItemSheet', ItemMacroConfig._init );
Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "Directory"));

/*
  Known Issues : 
    Favorites Tab for Tidy 5e Sheets does not work

  Ideas :
    add context menu for compendium
    add checks for if the item that is being editted is in a compendium (unlock?)
    add a token menu for executing item macros (personal? non-release?)
*/