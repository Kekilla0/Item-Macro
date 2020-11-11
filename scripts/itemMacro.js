"use strict";

let debug = false;
let log = (...args) => console.log("Item Macro | ", ...args);

export function renderItemSheet(app,html,data)
{
    ItemMacro._initHook(app,html,data);
}

function i18n(key)
{
    return game.i18n.localize(key);
}

class ItemMacro extends MacroConfig
{
    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            template : "modules/itemacro/templates/macro-config.html",
            classes : ["macro-sheet", "sheet"]
        });
    }
    /*override*/
    async getData() {
        const data = super.getData();
        data.command = await checkMacro(this.entity);
        return data;
    }
    /*override*/
    _onEditImage(event){
        return ui.notifications.error(`You cannot edit the icon for the macro.`);
    }
    /*override*/
    async _updateObject(event, formData){
        setMacro(this.entity,formData.command);
    }
    /*override*/
    async _onExecute(event) {
        event.preventDefault();
        await this._onSubmit(event, {preventClose: true}); 
        executeMacro(this.entity); 
    }    
    static _initHook(app,html,data)
    {
        if(game.user.isGM){
            let openButton = $(`<a class="open-itemacro" title="itemacro"><i class="fas fa-sd-card"></i>Item Macro</a>`);
            openButton.click( event => {
                let Macro = null;
                for (let key in app.entity.apps) {
                    let obj = app.entity.apps[key];
                    if (obj instanceof ItemMacro) {
                        Macro = obj;
                        break;
                    }
                }
                if(!Macro) Macro = new ItemMacro(app.entity,{});
                Macro.render(true);
            });
            html.closest('.app').find('.open-itemacro').remove();
            let titleElement = html.closest('.app').find('.window-title');
            openButton.insertAfter(titleElement);

            
        }
    }
}
async function setMacro(item, command)
{ 
    item.unsetFlag('itemacro','macro').then(()=>{
        item.setFlag('itemacro','macro', new Macro ({
            name : item.data.name,
            type : "script",
            scope : "global",
            command : command,
            author : game.user.id
        }));
    });
}
function checkMacro(item)
{
    return hasMacro(item) ? item.getFlag('itemacro', 'macro.data.command') : "";
}
function executeMacro(item)
{
    let actorID = item.actor.id;
    let itemID = item.id;

    let cmd = ``;

    if(item.actor.isToken)
    {
        actorID = item.actor.token.id;
        cmd += `const item = game.actors.tokens["${actorID}"].items.get("${itemID}"); ${checkMacro(item)}`;
    }else{
        cmd += `const item = game.actors.get("${actorID}").items.get("${itemID}"); ${checkMacro(item)}`;
    }

    new Macro ({ 
        name : item.name,
        type : "script",
        scope : "global",
        command : cmd,
        author : game.user.id
    }).execute();
}
export async function createHotbarMacro(item, slot)
{
    let command = ``, name = ``, flags = item.data.flags.itemacro?.macro;

    log(item);

    if(flags === undefined || flags?.data.command === "")
    {
        command = getDefaultCommand(item);
    }else{
        command = item.tokenId 
            ? `ItemMacro.runMacro("${item.tokenId}","${item.data._id}");`
            : `ItemMacro.runMacro("${item.actorId}","${item.data._id}");`
    }

    name = `${item.data.name}`;
    if(!game.user.isGM)
    {        
        name += `_${game.user.charname}`;
    }else {
        name += `_GM`;
    }

    let macro = game.macros.entities.find(m => m.name.startsWith(name)  &&  m.data.command === command);
    if (!macro) {
        macro = await Macro.create({
            name: name,
            type: "script",
            img: item.data.img,
            command: command,
            flags: { "dnd5e.itemMacro": true }
        }, { displaySheet: false });
    }
    game.user.assignHotbarMacro(macro, slot);
}
export function runMacro(_actorID,_itemID) {

    let actor = game.actors.get(_actorID)
        ? game.actors.get(_actorID)
        : game.actors.tokens[`${_actorID}`];

    /*let actor = (canvas.tokens.controlled.length === 1 && canvas.tokens.controlled[0].actor._id === _actorID) 
        ? canvas.tokens.controlled[0].actor 
        : game.actors.get(_actorID);*/
    if(!actor) return ui.notifications.warn(`No actor by that ID.`);
    if(actor.permission != 3) return ui.notifications.warn(`No permission to use this actor.`);
    let item = actor.getOwnedItem(_itemID);
    if (!item) return ui.notifications.warn (`That actor does not own an item by that ID.`);

    executeMacro(item);
}

// Helper function to get list of all real actor items that have a macro attached.
// This function doesn't work if the itemmacro is only on the token's/synthetic actor's item.
export function getActorMacroItems(_actorID) {
    let actor = game.actors.get(_actorID);
    return actor.items.filter(item => hasMacro(item));
}

// Helper function to get list of all token actor items that have a macro attached.
// This function works if the itemmacro is only on the token's/synthetic actor's item.
export function getTokenActorMacroItems(_tokenID) {
    let actor = game.actors.tokens[_tokenID];
    if(!actor) actor = canvas.tokens.get(_tokenID).actor;
    return actor.items.filter(item => hasMacro(item));
}

// undefined and "" are both falsey, so if either the flag is undefined or the command is empty, this equates to false
// and setting flag the check means you don't need to run the getFlag command more than once.
export function hasMacro(item) {
    let flag = item.data.flags.itemacro?.macro;
    return flag && flag?.data.command;
}

function getDefaultCommand(item)
{
    //check for version, option, whatever for default command and return command string
    switch(game.system.id)
    {
        case "dnd5e" :
            return `game.dnd5e.rollItemMacro("${item.data.name}")`;
        case "sfrgp" :
            return `game.sfrpg.rollItemMacro("${item.data.name}");`;
    }
}

export function addItemSheetButtons(app,html,data,triggeringElement="",buttonContainer="")
{
    if(app.permission < 3) return;

    if(debug) log("addItemSheetButtons | ", app, html);

    // Setting default element selectors
    if (triggeringElement === "")
        triggeringElement = ".item .item-name";

    if (buttonContainer === "")
        buttonContainer = ".item-properties";

    if (["BetterNPCActor5eSheet", "BetterNPCActor5eSheetDark"].includes(app.constructor.name)) {
      triggeringElement = ".item .npc-item-name"
      buttonContainer = ".item-properties"
    }

    html.find(triggeringElement).click(event => {
        let li = $(event.currentTarget).parents(".item");
        addButtons(li,app,buttonContainer);
    });

    for (let element of html.find(triggeringElement)) {
        let li = $(element).parents('.item');
        addButtons(li, app, buttonContainer);
    }
}

function addButtons(li,actorSheet,buttonContainer)
{
    if(debug) log("Add Buttons | ",li);
    if(debug) log("Add Buttons | ",actorSheet);
    if(debug) log("Add Buttons | ",buttonContainer);

    if(String(li.attr("data-item-id")) === "undefined") return;
    let actor = actorSheet.actor;
    if(!actor) return;
    if(debug) log("Add Buttons | ",actor);
    let item = actor.getOwnedItem(String(li.attr("data-item-id")));
    if(!item) return;
    if(debug) log("Add Buttons | ",item);
    let flags = item.data.flags.itemacro?.macro;
    if(debug) log("Add Buttons | ",flags);

    if(flags === undefined || flags?.data.command === "") return;
    
    if(!li.hasClass("expanded")) return;

    if(li.find(buttonContainer).find(".item-buttons").length !== 0) return;

    let buttons = $(`<div class="item-buttons"></div>`);
    
    buttons.append(`<span class="tag"><button data-action="itemacro">${i18n("im.buttons.roll")}</button></span>`);
    buttons.append(`<span class="tag"><button data-action="default">${i18n("im.buttons.default")}</button></span>`);

    //adding the buttons to the sheet
    let targetHTML = li; 
    targetHTML.find(buttonContainer).prepend(buttons);

    //adding click events for all buttons
    buttons.find('button').click((event) => {
        event.preventDefault();
        event.stopPropagation();
        switch(event.target.dataset.action)
        {
            case "itemacro" :
                if(actor.isToken)
                {
                    runMacro(actor.token.id,item.id);
                }else{
                    runMacro(actor.id,item.id);
                }
                break;
            case "default" :
                item.roll(event);
                break;
        }
    });
}

export function changeButtons(app,html,data)
{
    if(app && app.permission < 3) return;

    let itemImage = html.find(data);
    if(debug) log("Change Buttons | ", html, data, itemImage);
    if(itemImage.length > 0)
    {
        if(!game.modules.get("betterrolls-swade")?.active || game.system.id !== "swade")
        {
            itemImage.off();
        }
        
        itemImage.click(async (event) => {
            if(game.system.id==="swade") return;

            let li = $(event.currentTarget).parents(".item");
            if(String(li.attr("data-item-id")) === "undefined") return;
            let item = app.actor.getOwnedItem(String(li.attr("data-item-id")));
            let flags = item.data.flags.itemacro?.macro;

            if(flags === undefined || flags?.data.command === "")
            {
                switch(game.system.id)
                {
                    case "sfrpg" :
                    case "dnd5e" :
                        if(item.data.type===`spell`)
                        {
                            item.actor.useSpell(item);
                        }else {
                            item.roll(event);
                        }
                        break;
                }
            }else{
                if(app.actor.isToken)
                {
                    runMacro(app.actor.token.id,item.id);
                }else{
                    runMacro(app.actor.id,item.id);
                }
            }
        });

        itemImage.contextmenu(async (event)=> {
            if(game.system.id !== "swade") return;

            let li = $(event.currentTarget).parents(".item");
            if(String(li.attr("data-item-id")) === "undefined") return;
            let item = app.actor.getOwnedItem(String(li.attr("data-item-id")));
            let flags = item.data.flags.itemacro?.macro;

            if(flags !== undefined || flags?.data.command !== "")
            {
                if(app.actor.isToken)
                {
                    runMacro(app.actor.token.id, item.id);
                }else{
                    runMacro(app.actor.id,item.id);
                }
            }
        });

    }
}
