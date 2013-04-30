moduleAid.VERSION = '1.0.1';

this.__defineGetter__('addonBar', function() { return $('addon-bar'); });
this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });

this.doOpenOptions = function() {
	openOptions();
};

this.setContextMenu = function(e) {
	toggleAttribute(contextOptions, 'hidden', !isAncestor(e.originalTarget.triggerNode, addonBar));
	toggleAttribute(contextSeparator, 'hidden', !isAncestor(e.originalTarget.triggerNode, addonBar));
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'addonBar');
	listenerAid.add(contextMenu, 'popupshown', setContextMenu, false);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(contextMenu, 'popupshown', setContextMenu, false);
	overlayAid.removeOverlayWindow(window, 'addonBar');
};
