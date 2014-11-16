Modules.VERSION = '1.0.2';

// list of buttons that will be forced to have the toolbarbutton-1 class when in our toolbars
this.buttonsClassForce = [
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
];

this.buttonsListener = {
	// always remove the class when doing this, so we're sure we only force the class in our toolbars
	onWidgetBeforeDOMChange: function(aNode) {
		if(buttonsClassForce.indexOf(aNode.id) > -1) {
			aNode.classList.remove('toolbarbutton-1');
		}
	},
	onWidgetAfterDOMChange: function(aNode, aNextNode, aContainer, aIsRemoval) {
		if(!aIsRemoval && aContainer && buttonsClassForce.indexOf(aNode.id) > -1) {
			aNode.classList.add('toolbarbutton-1');
		}
	}
};

Modules.LOADMODULE = function() {
	CustomizableUI.addListener(buttonsListener);
};

Modules.UNLOADMODULE = function() {
	CustomizableUI.removeListener(buttonsListener);
};
