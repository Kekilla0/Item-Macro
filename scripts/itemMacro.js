"use strict";

let debug = true;
let log = (...args) => console.log("Item Macro | ", ...args);

export function renderItemSheet(app,html,data)
{
    ItemMacro._initHook(app,html,data);
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
    log(item);
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

    //dnd5e
    return `game.dnd5e.rollItemMacro("${item.data.name}");`
}
