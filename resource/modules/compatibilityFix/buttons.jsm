/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.1.0

this.buttons = {
	// list of buttons that will be forced to have the toolbarbutton-1 class when in our toolbars
	classes: [
		// https://addons.mozilla.org/firefox/addon/cookiesafe-ff-4-compatible/
		'cookiesafe-button',

		// https://addons.mozilla.org/firefox/addon/quickjava/
		"QuickJava_ToolbarIcon_Container_JavaScript",
		"QuickJava_ToolbarIcon_Container_Java",
		"QuickJava_ToolbarIcon_Container_Flash",
		"QuickJava_ToolbarIcon_Container_Silverlight",
		"QuickJava_ToolbarIcon_Container_AnimatedImage",
		"QuickJava_ToolbarIcon_Container_Cookies",
		"QuickJava_ToolbarIcon_Container_Images",
		"QuickJava_ToolbarIcon_Container_CSS",
		"QuickJava_ToolbarIcon_Container_Proxy"
	],

	// always remove the class when doing this, so we're sure we only force the class in our toolbars
	onWidgetBeforeDOMChange: function(aNode) {
		if(this.classes.indexOf(aNode.id) > -1) {
			aNode.classList.remove('toolbarbutton-1');
		}
	},
	onWidgetAfterDOMChange: function(aNode, aNextNode, aContainer, aIsRemoval) {
		if(!aIsRemoval && aContainer && this.classes.indexOf(aNode.id) > -1) {
			aNode.classList.add('toolbarbutton-1');
		}
	}
};

Modules.LOADMODULE = function() {
	Styles.load('buttons', 'buttons');
	CustomizableUI.addListener(buttons);
};

Modules.UNLOADMODULE = function() {
	CustomizableUI.removeListener(buttons);
	Styles.unload('buttons');
};
