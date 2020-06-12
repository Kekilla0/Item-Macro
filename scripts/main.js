//Import TypeScript Modules
import * as itemacro from './itemMacro.js';

let hotbarHandler = (bar, data, slot) => {
    if (data.type !== "Item") return true;
    itemacro.createHotbarMacro(data, slot);
    return false;
}

/* Initialize Module */
Hooks.on('init', () =>{
    console.log('Item Macro | Initializing module.');
});

Hooks.on('setup', () =>{
    //settings
    game.settings.register("itemacro",'hotbar', {
        name :"Hookbar Hook",
        hint :"Enabling this will allow item macro to create macro's when dragged to the hotbar.",
        scope :"world",
        config : true,
        default : false,
        type : Boolean,
        onChange : value => {
            window.location.reload();
        }
    });
    game.settings.register("itemacro",'charsheet', {
        name :"Character Sheet Hook",
        hint :"Enabling this will allow item macro to roll macros from the character sheet.",
        scope :"world",
        config : false,
        default : false,
        type : Boolean,
        onChange : value => {
            window.location.reload();
        }
    });
    window.ItemMacro = {
        runMacro: itemacro.runMacro
    };
    //hook hotbar
    if(game.settings.get('itemacro','hotbar')){
        Hooks._hooks.hotbarDrop = [hotbarHandler].concat(Hooks._hooks.hotbarDrop || []);
    }
    //hook sheet buttons, when complete change setting ^^^ to config : true or you wont be able to test it.
    if(game.settings.get('itemacro','charsheet')){
        //allow change
    }
});
/* hook onto change of settings, reload on change */
Hooks.on('renderItemSheet', (app, html, data) => {
    itemacro.renderItemSheet(app,html,data);
});


