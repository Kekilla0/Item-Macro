import { settings } from './settings.js';
import { helper } from './helper.js';
import { ItemMacroConfig } from './ItemMacroConfig.js';

//CONFIG.debug.hooks = true;

Hooks.on('init', settings.register );
Hooks.on('ready', helper.register );
Hooks.on('renderItemSheet', ItemMacroConfig._init );
Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "ItemDirectory"));
Hooks.on('getCompendiumDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "CompendiumDirectory"));
Hooks.on('getCompendiumEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "CompendiumEntry"));

/*
  Known Issues : 
    Tidy 5e Sheets right click.

  TODO Fixes :

  TODO Ideas :
    !! NOT PLANNED add system CyberPunk RED !!
    add system Warhammer Fantasy
    add system Pathfinder 2e
    add capability to update all items in a compendium via a compendium
      !figure out a way to only add context option to items compendium
      !Update All Item Macros
    add capability to update all items based on 1 item in a compendium
      !figure out a way to only add context option to items with item-macros
      !Update All via that Item Macro      

  Update Notes :
    Added Context Menu for Compendium Directory --InProgress
    Added Context Menu for Compendium Entry --InProgress

*/