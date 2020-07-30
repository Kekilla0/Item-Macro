"use strict";

let debug = false;
let log = (...args) => console.log("Item Macro | ", ...args);

function renderItemSheet(app,html,data)
{
    ItemMacro._initHook(app,html,data);
}

export function i18n(key)
{
    return game.i18n.localize(key);
}

class ItemMacro extends MacroConfig
{
    static get defaultOptions(){
        return mergeObject(super.defaultOptions, {
            template : "modules/itemacro/templates/macro-config.html"
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
async function checkMacro(item)
{
    if(item.getFlag('itemacro','macro') === undefined || item.getFlag('itemacro','macro').data.command === "")
    {
        let command = createCommand(item);
        setMacro(item, command);
        return command;
    }else{
        return await item.getFlag('itemacro','macro.data.command');
    }
}
async function executeMacro(item)
{
    let cmd = await checkMacro(item);
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
    checkMacro(item.data);
    let command = `ItemMacro.runMacro("${item.actorId}","${item.data._id}");`;
    let name = `${item.data.name}`;
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
export async function runMacro(_actorID,_itemId) {
    let actor = (canvas.tokens.controlled.length === 1 && canvas.tokens.controlled[0].actor._id === _actorID) 
        ? canvas.tokens.controlled[0].actor 
        : game.actors.get(_actorID);
    if(!actor) return ui.notifications.warn(`No actor by that ID.`);
    if(actor.permission != 3) return ui.notifications.warn(`No permission to use this actor.`);
    let item = actor.getOwnedItem(_itemId);
    if (!item) return ui.notification.warn (`That actor does not own an item by that ID.`);

    executeMacro(item);
}
function createCommand(item)
{
    //check for version, option, whatever for default command and return command string
    switch(game.system.id)
    {
        case "dnd5e" :
            return `game.dnd5e.rollItemMacro("${item.data.name}")`;
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
    if(debug) log(li,actorSheet,buttonContainer);

    if(String(li.attr("data-item-id")) === "undefined") return;
    let actor = actorSheet.actor;
    let item = actor.getOwnedItem(String(li.attr("data-item-id")));
    let flags = item.data.flags.itemacro?.macro;
    if(debug) log(actor,item,flags);

    if(flags === undefined) return;
    
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
                runMacro(actor.id,item.id);
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
    if(debug) log("Change Buttons | ", app,html,data);

    let itemImage = html.find(data);
    if(itemImage.length > 0)
    {
        itemImage.off();
        itemImage.click(async (event) => {
            let li = $(event.currentTarget).parents(".item");
            if(String(li.attr("data-item-id")) === "undefined") return;
            let item = app.actor.getOwnedItem(String(li.attr("data-item-id")));

            let flags = item.data.flags.itemacro?.macro;

            if(flags === undefined)
            {
                item.roll(event);
            }else{
                runMacro(app.actor.id,item.id);
            }
        });
    }
}
