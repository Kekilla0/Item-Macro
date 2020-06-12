"use strict";

let debug = true;
let log = (...args) => console.log("Item Macro | ", ...args);

export function renderItemSheet(app,html,data)
{
    SheetMacro._initEntityHook(app,html,data);
}

class SheetMacro extends FormApplication{
    constructor(object, options) {
        super(object,options);
        this.entity.apps[this.appId] = this;
    }
    get entity() {
        return this.object; 
    }
    static get defaultOptions(){
        const options = super.defaultOptions;
        options.template = "modules/itemacro/templates/templates.html";
        options.width = '600';
        options.height = '700';
        options.classes = ['itemacro','macro'];
        options.resizable = true;
        options.editable = true;
        options.closeOnSubmit = true;
        options.submitOnClose = true;
        return options;
    }
	static _initEntityHook(app, html, data) {
        if (game.user.isGM) {
            let openBtn = $(`<a class="open-itemacro" title="itemacro"><i class="fas fa-sd-card"></i>Item Macro</a>`);
            openBtn.click(ev => {
                let Macro = null;
                for (let key in app.entity.apps) {
                    let obj = app.entity.apps[key];
                    if (obj instanceof SheetMacro) {
                        Macro = obj;
                        break;
                    }
                }
                if (!Macro) Macro = new SheetMacro(app.entity,{});
                Macro.render(true);
            });
            html.closest('.app').find('.open-itemacro').remove();
            let titleElement = html.closest('.app').find('.window-title');
            openBtn.insertAfter(titleElement);
        }
    }
    async getData(){
        const data = super.getData();
        data.commandText = await checkMacro(this.entity);
        data.flags = this.entity.data.flags;
        data.owner = game.user.id;
        data.isGM = game.user.isGM;
        return data;
    }
    activateListeners(html){
        super.activateListeners(html);
        html.find('.executeMacro').click(ev => this._executeMacro(html));
        html.find('.saveMacro').click(ev => this._saveMacro(html));
    }
    async _updateObject(event, formData){
        if(game.user.isGM)
        {
            if(debug) log("_updateObject : ", event, formData);
            setMacro(this.entity,formData.command);
        }else {
            ui.notifications.error("You have to be GM to edit item macros.");
        }
    }
    async _executeMacro(html){   
        executeMacro(this.entity.data.name, html[0][0].value);
    }
    async _saveMacro(html){
        if(game.user.isGM)
        {
            if(debug) log ("_saveMacro : ", html);
            setMacro(this.entity, html[0][0].value);
        }else {
            ui.notifications.error("You have to be GM to edit item macros.");
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
async function getMacro(item){
    let returnData = {};
    if(item.getFlag('itemacro','macro') !== undefined)
    {
        returnData = await item.getFlag('itemacro','macro').data;
    }
    return returnData;
}
async function checkMacro(item)
{
    if(item.getFlag('itemacro','macro') === undefined || item.getFlag('itemacro','macro').data.command === "")
    {
        let command = createCommand(item);
        setMacro(item, command);
        return command;
    }else{
        return item.getFlag('itemacro','macro.data.command');
    }
}
function executeMacro(name,command)
{
    new Macro ({ 
        name : name,
        type : "script",
        scope : "global",
        command : command,
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
    let actor = game.actors.get(_actorID);
    if(!actor) return ui.notifications.warn(`No actor by that ID.`);
    let item = actor.getOwnedItem(_itemId);
    if (!item) return ui.notification.warn (`That actor does not own an item by that ID.`);
    if(actor.permission != 3) return ui.notifications.warn(`No permission to use this actor.`);
    if (debug) log(`Actor : `, actor);
    if (debug) log(`Item : `, item);
    executeMacro("", await checkMacro(item));

    if (debug) log(`Run Macro has executed for Actor ${actor.name} using the ${item.name} item.`);
}
function createCommand(item)
{
    //check for version, option, whatever for default command and return command string

    //dnd5e
    return `game.dnd5e.rollItemMacro("${item.data.name}");`
}
