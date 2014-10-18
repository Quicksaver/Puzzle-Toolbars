moduleAid.VERSION = '1.0.0';

// list of buttons that will be forced to have the toolbarbutton-1 class when in our toolbars
this.buttonsClassForce = ['cookiesafe-button'];

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

moduleAid.LOADMODULE = function() {
	CustomizableUI.addListener(buttonsListener);
};

moduleAid.UNLOADMODULE = function() {
	CustomizableUI.removeListener(buttonsListener);
};
