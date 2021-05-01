# Item Macro

This is a FoundryVTT module for the 5e, SFRPG, and SWADE (as of now) system. It allow macros to be saved inside of an item and for various different ways to execute macors.  
You can execute the macro from the "item" class using the executeMacro(...args) function, from the character sheet (if the settings are satisfied to do so), from the hotbar using the default rollItemMacro function for your system (if the settings are satisfied to do so), or from token-action-hud.

# Known Issues

Token Action Hud may experience some problems with the update.
Midi-QOL should be fine with the update.
Tidy Sheets Favorite tab will not work with this update.

# Installation

1. Inside Foundry's Configuration and Setup screen, go to **Add-on Modules**
2. Click "Install Module"
3. In the Manifest URL field paste: `https://github.com/Kekilla0/Item-Macro/raw/master/module.json`

# Usage

Once activated, open an Item Sheet, click on the Item Macro button to open the Macro window.
![In Action](https://i.gyazo.com/a973845c112317bbef57691cfc657cb0.gif)

Various different settings will change the way Item Macro interacts with the game server.
![In Action](https://i.gyazo.com/34c41d778628a1b35adf11e0810e080c.png)

With no settings enabled, you can still execute the macro that is saved in the item, perfect for macros!
![In Action](https://i.gyazo.com/26ab88645e554ac5b7522a4e8b926e3c.gif)

Added context menu support allowing GM users to mass update item-macros on like named items throughout the game!
(the context menu is on items in the game directory, will update all item-macros in the item-directory, actor items, and token items)

# Support

For questions, feature requests, or bug reports, feel free to contact me on the Foundry Discord (Kekilla#7036) or open an issue here directly.

# License

This Foundry VTT module, writen by Winks, is licensed under a [Creative Commons Attribution 4.0 International License](https://creativecommons.org/licenses/by/4.0/).

This work is licensed under [Foundry Virtual Tabletop EULA - Limited License Agreement for module development](https://foundryvtt.com/article/license/).
