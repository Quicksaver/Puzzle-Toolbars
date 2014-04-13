moduleAid.VERSION = '1.1.9';

this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('bottomBox', function() { return $('browser-bottombox'); });
this.__defineGetter__('addonBar', function() { return (!Australis) ? $('addon-bar') : $(objName+'-addon-bar'); });
this.__defineGetter__('statusBar', function() { return (Australis) ? _statusBar.node || $('status-bar') : $('status-bar'); });

this.__defineGetter__('customizing', function() { return trueAttribute((Australis) ? document.documentElement : addonBar, 'customizing'); });

this.showWhenMigrated = function() {
	if(oldBarMigrated) {
		if(addonBar.collapsed) {
			toggleAddonBar();
		}
		
		oldBarMigrated = false;
	}
};

this.toggleAutoHide = function(e) {
	var isCustomizing = (e && e.type == 'beforecustomization') || customizing;
	
	moduleAid.loadIf('autoHide',
		!isCustomizing
		&& prefAid.placement != 'bottom'
		&& prefAid.autoHide
		&& (prefAid.placement == 'corner' || prefAid.showPPs));
};

this.togglePlacement = function(e) {
	// I can't drag from the add-on bar when it's in the url bar, it only drags the whole url bar in this case
	var isCustomizing = (e && e.type == 'beforecustomization') || customizing;
	
	if(!isCustomizing && addonBar.parentNode.id == 'customization-palette-container') {
		bottomBox.insertBefore(addonBar, $('developer-toolbar'));
	}
	
	moduleAid.loadIf('inURLBar', !isCustomizing && prefAid.placement == 'urlbar');
	setAttribute(addonBar, 'placement', (!isCustomizing) ? prefAid.placement : 'bottom');
	
	if(isCustomizing && addonBar.parentNode.id != 'customization-palette-container') {
		$('customization-palette-container').appendChild(addonBar);
	}
	
	// it would imediatelly hide the addonBar when toggling placement with autoHide already loaded
	dispatch(addonBar, { type: 'ChangedAddonBarPlacement', cancelable: false });
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	moduleAid.load('initAddonBar');
	moduleAid.load('placePP');
	
	listenerAid.add(window, 'beforecustomization', togglePlacement);
	listenerAid.add(window, 'aftercustomization', togglePlacement);
	listenerAid.add(window, 'beforecustomization', toggleAutoHide);
	listenerAid.add(window, 'aftercustomization', toggleAutoHide);
	
	prefAid.listen('autoHide', toggleAutoHide);
	prefAid.listen('showPPs', toggleAutoHide);
	prefAid.listen('placement', toggleAutoHide);
	prefAid.listen('placement', togglePlacement);
	
	togglePlacement();
	toggleAutoHide();
	
	if(Australis) {
		listenerAid.add(window, 'MigratedFromAddonBar', showWhenMigrated);
		showWhenMigrated();
	}
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('autoHide', toggleAutoHide);
	prefAid.unlisten('showPPs', toggleAutoHide);
	prefAid.unlisten('placement', toggleAutoHide);
	prefAid.unlisten('placement', togglePlacement);
	
	if(Australis) {
		listenerAid.remove(window, 'MigratedFromAddonBar', showWhenMigrated);
	}
	
	listenerAid.remove(window, 'beforecustomization', togglePlacement);
	listenerAid.remove(window, 'aftercustomization', togglePlacement);
	listenerAid.remove(window, 'beforecustomization', toggleAutoHide);
	listenerAid.remove(window, 'aftercustomization', toggleAutoHide);
	
	removeAttribute(addonBar, 'placement');
	
	moduleAid.unload('autoHide');
	moduleAid.unload('inURLBar');
	moduleAid.unload('placePP');
	moduleAid.unload('initAddonBar');
	moduleAid.unload('compatibilityFix/windowFixes');
};
