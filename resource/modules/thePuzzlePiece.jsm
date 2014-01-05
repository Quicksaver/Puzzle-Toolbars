moduleAid.VERSION = '1.1.1';

this.__defineGetter__('addonBar', function() { return (!Australis) ? $('addon-bar') : $(objName+'-addon-bar'); });

this.toggleAddonBar = function() {
	setToolbarVisibility(addonBar, addonBar.collapsed);
};

this.toggleAutoHide = function() {
	moduleAid.loadIf('autoHide', prefAid.placement != 'bottom' && prefAid.autoHide);
};

this.togglePlacement = function(e) {
	// I can't drag from the add-on bar when it's in the url bar, it only drags the whole url bar in this case
	var customizing = (e && e.type == 'beforecustomization') || trueAttribute(addonBar, 'customizing');
	
	moduleAid.loadIf('inURLBar', !customizing && prefAid.placement == 'urlbar');
	setAttribute(addonBar, 'placement', (!customizing) ? prefAid.placement : 'bottom');
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	moduleAid.load('initAddonBar');
	moduleAid.load('placePP');
	
	listenerAid.add(window, 'beforecustomization', togglePlacement);
	listenerAid.add(window, 'aftercustomization', togglePlacement);
	
	prefAid.listen('autoHide', toggleAutoHide);
	prefAid.listen('placement', toggleAutoHide);
	prefAid.listen('placement', togglePlacement);
	
	togglePlacement();
	toggleAutoHide();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('autoHide', toggleAutoHide);
	prefAid.unlisten('placement', toggleAutoHide);
	prefAid.unlisten('placement', togglePlacement);
	
	listenerAid.remove(window, 'beforecustomization', togglePlacement);
	listenerAid.remove(window, 'aftercustomization', togglePlacement);
	
	removeAttribute(addonBar, 'placement');
	
	moduleAid.unload('inURLBar');
	moduleAid.unload('autoHide');
	moduleAid.unload('placePP');
	moduleAid.unload('initAddonBar');
	moduleAid.unload('compatibilityFix/windowFixes');
};
