//Import TypeScript Modules
import * as itemacro from './itemMacro.js';

let log = (...args) => console.log("Item Macro | ", ...args);

let hotbarHandler = (bar, data, slot) => {
    if (data.type !== "Item") return true;
    itemacro.createHotbarMacro(data, slot);
    return false;
}

function i18n(key)
{
    return game.i18n.localize(key);
}

let knownSheets = {
    BetterNPCActor5eSheet: ".item .rollable",
    ActorSheet5eCharacter: ".item .item-image",
    BetterNPCActor5eSheetDark: ".item .rollable",
    ActorSheet5eCharacterDark: ".item .item-image",
    DarkSheet: ".item .item-image",
    ActorNPC5EDark: ".item .item-image",
    DynamicActorSheet5e: ".item .item-image",
    ActorSheet5eNPC: ".item .item-image",
    DNDBeyondCharacterSheet5e: ".item .item-name .item-image",
    Tidy5eSheet:  ".item .item-image",
    Tidy5eNPC: ".item .item-image",
    MonsterBlock5e: ".item .item-name",
    ActorSheetSFRPGCharacter : ".item .item-image",
  
  //  Sky5eSheet: ".item .item-image",
};

/* Initialize Module */
Hooks.on('init', () =>{
    log("Initalizing Module.");
});

/* Setup Module */
Hooks.on('setup', () =>{
    game.settings.register("itemacro",'hotbar', {
        name : i18n("im.settings.barhook.title"),
        hint : i18n("im.settings.barhook.hint"),
        scope :"world",
        config : true,
        default : false,
        type : Boolean,
        onChange : value => {
            window.location.reload();
        }
    });
    game.settings.register("itemacro",'charsheet', {
        name : i18n("im.settings.sheethook.title"),
        hint : i18n("im.settings.sheethook.hint"),
        scope :"world",
        config : true,
        default : false,
        type : Boolean,
        onChange : value => {
            window.location.reload();
        }
    });
    window.ItemMacro = {
        runMacro: itemacro.runMacro,
        getActorItems: itemacro.getActorMacroItems,
        getTokenItems: itemacro.getTokenActorMacroItems,
        hasMacro: itemacro.hasMacro
    };
    if(game.settings.get('itemacro','hotbar')){
        Hooks._hooks.hotbarDrop = [hotbarHandler].concat(Hooks._hooks.hotbarDrop || []);
    }
    //hook sheet buttons, when complete change setting ^^^ to config : true or you wont be able to test it.
    if(game.settings.get('itemacro','charsheet')){
        //allow change
        for (let sheetName of Object.keys(knownSheets)) {
            Hooks.on("render" + sheetName, (app,html,data) => {
                itemacro.addItemSheetButtons(app,html,data)
                itemacro.changeButtons(app,html,knownSheets[sheetName]);
            });
        }
        Hooks.on("renderedAlt5eSheet", (app,html,data) => {
            itemacro.addItemSheetButtons(app,html,data);
            itemacro.changeButtons(app,html,".item .item-image");
        });
        Hooks.on("renderedTidy5eSheet", (app,html,data) => {
            itemacro.addItemSheetButtons(app,html,data);
            itemacro.changeButtons(app,html,".item .item-image");
        });
    }
});

Hooks.on('renderItemSheet', (app, html, data) => {
    itemacro.renderItemSheet(app,html,data);
});


