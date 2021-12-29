import { settings } from './settings.js';
import { helper } from './helper.js';
import { ItemMacroConfig } from './ItemMacroConfig.js';

//CONFIG.debug.hooks = true;

Hooks.on('init', settings.register );
Hooks.on('setup', () => Macros.registerSheet("macroeditor", ItemMacroConfig, { makeDefault : false, label : "Item Macro Config"}));
Hooks.on('ready', helper.register );
Hooks.on('renderItemSheet', ItemMacroConfig._init );
Hooks.on('getItemDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "ItemDirectory"));
Hooks.on('getCompendiumDirectoryEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "CompendiumDirectory"));
Hooks.on('getCompendiumEntryContext', (html, contextOptions) => helper.addContext(contextOptions, "CompendiumEntry"));

/*
  Known Issues : 
    Tidy 5e Sheets right click.

  TODO Fixes :
    ! Added support for v9 sheet registration

  TODO Ideas :
    !! NOT PLANNED add system CyberPunk RED !!
    add system Warhammer Fantasy
    add system Pathfinder 2e    

  Update Notes :
    Added Context Menu for Compendium Directory 
    Added Context Menu for Compendium Entry 
*/