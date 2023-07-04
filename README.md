# Credits
This module was originally made by Kekilla0 and can be found on https://github.com/Kekilla0/Item-Macro. This fork is specifically made to fix issues that cropped in in V11.

# Item Macro

This is a FoundryVTT module for the **5e, SFRPG, SWADE, Old-School Essentials, Dungeon World, and Simple Worldbuilding (as of now) systems. It allow macros to be saved inside of an item and for various different ways to execute macros.  
You can execute the macro from the "item" class using the executeMacro(...args) function, from the character sheet (if the settings are satisfied to do so), from the hotbar using the default rollItemMacro function for your system (if the settings are satisfied to do so), or from token-action-hud.

# Installation

1. Inside Foundry's Configuration and Setup screen, go to **Add-on Modules**
2. Click "Install Module"
3. Seach for the Module, install in the Module Manager.
4. In the Manifest URL field paste: `https://github.com/Kekilla0/Item-Macro/releases/download/v1.5.3/module.json`

# Usage

Once activated, open an Item Sheet, click on the Item Macro button to open the Macro window.
![In Action](https://i.gyazo.com/a973845c112317bbef57691cfc657cb0.gif)

Various different settings will change the way Item Macro interacts with the game server.
![In Action](https://i.gyazo.com/34c41d778628a1b35adf11e0810e080c.png)

With no settings enabled, you can still execute the macro that is saved in the item, perfect for macros!
![In Action](https://i.gyazo.com/26ab88645e554ac5b7522a4e8b926e3c.gif)

Added context menu support allowing GM users to mass update item-macros on like named items throughout the game!
(the context menu is on items in the game directory, will update all item-macros in the item-directory, actor items, and token items)

## Added Item Functionality

1. Item.hasMacro() => returns boolean on if the item has a macro command
2. Item.getMacro() => returns Macro instance, if the item has a macro command
3. Item.setMacro(Macro) => overwrites and saves given Macro to the Item
4. Item.executeMacro(...args) => executes Macro command, giving `item`, `speaker`, `actor`, `token`, `character`, and `event` constants. This is recognized as the macro itself. Pass an event as the first argument.

## Added System Functionality

### Simple Worldbuilding

* Item names on actor sheets have been converted to rollable links that will execute the macro attached to the item when the "Enable Character Sheet Hook" is enabled.
* Item names will now highlight on hover to indicate this added functionality.
* Dragging an item to the hotbar will create a macro utilizing an added system helper `game.worldbuilding.rollItemMacro(itemNameString)`.
* Dropping formula-type item attributes will continue to create the default `new Roll` system macro.

# Support

For questions, feature requests, or bug reports, feel free to contact me on the Foundry Discord (honeybadger#2614) or open an issue here directly.

# License

This Foundry VTT module, writen by Kekilla, is licensed under a [MIT License](https://github.com/Kekilla0/Item-Macro/blob/main/LICENSE).

This work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).
