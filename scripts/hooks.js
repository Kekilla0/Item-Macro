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
    Update calls to "this" inside of an item macro

  Fixes :
    !add capability to update all items via a specific item in a compendium
      ?requires update to foundry core code, issue sent
    !fix "token" variable document issues

  TODO Ideas :
    add checks for if the item that is being editted is in a compendium (unlock?)
    add capability to update all items via a compendium
    add systems
      ?PF2E
        !basic use first
        !determine if basic operation can be used for non-items
      ?SW5e
        !download the system
        !contact someone who plays the system
      ?Warhammer Fantasy Roleplay
        !download the system
        !contact someone who plays the system
      ?Cyberpunk Red
        !download the system
        !contact someone who plays the system

  Update Notes :
    added simple world building support
    updated for new macro data structure
    updated itemmacroconfig to be "macro" type instead of "item"
    removed macro pack
    fixed updating issue
    fixed token issue
*/