import {logger} from './logger.js';
import {settings} from './settings.js';
import {ItemMacroConfig} from './ItemMacroConfig.js';
import * as helper from './helper.js';

logger.info("Initializing Module.");
/*
  Hooks
*/
Hooks.on('init', settings.register );
Hooks.on('ready', helper.register );
Hooks.on('renderItemSheet', ItemMacroConfig._init );

/*
  Known Issues : 
    Favorites Tab for Tidy 5e Sheets does not work
*/