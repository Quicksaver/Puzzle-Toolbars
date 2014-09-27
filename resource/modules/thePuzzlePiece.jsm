moduleAid.VERSION = '1.3.0';

this.__defineGetter__('PrintPreviewListener', function() { return window.PrintPreviewListener; });
this.__defineGetter__('gBrowser', function() { return window.gBrowser; });
this.__defineGetter__('bottomBox', function() { return $('browser-bottombox'); });
this.__defineGetter__('addonBar', function() { return $(objName+'-addon-bar'); });
this.__defineGetter__('statusBar', function() { return _statusBar.node || $('status-bar'); });

this.__defineGetter__('customizing', function() {
	if(trueAttribute(document.documentElement, 'customizing')) { return true; }
	
	// this means that the window is still opening and the first tab will open customize mode
	if(window.gBrowser.mCurrentBrowser
	&& window.gBrowser.mCurrentBrowser.__SS_restore_data
	&& window.gBrowser.mCurrentBrowser.__SS_restore_data.url == 'about:customizing') {
		return true;
	}
	
	return false;
});

this.addonBarCustomized = {
	onWidgetAdded: function(aWidget, aArea) { this.listener(aWidget, aArea); },
	onWidgetRemoved: function(aWidget, aArea) { this.listener(aWidget, aArea); },
	listener: function(aWidget, aArea) {
		if(aArea == addonBar.id && !trueAttribute(addonBar, 'customizing')) {
			dispatch(addonBar, { type: 'AddonBarCustomized', cancelable: false });
		}
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
	
	// first unload what doesn't need to be loaded, so these don't conflict with each other
	if(prefAid.placement != 'urlbar') {
		moduleAid.unload('inURLBar');
	}
	if(prefAid.placement != 'corner') {
		moduleAid.unload('inCorner');
	}
	
	moduleAid.loadIf('inURLBar', !isCustomizing && prefAid.placement == 'urlbar');
	moduleAid.loadIf('inCorner', !isCustomizing && prefAid.placement == 'corner');
	setAttribute(addonBar, 'placement', (!isCustomizing) ? prefAid.placement : 'bottom');
	
	// it would imediatelly hide the addonBar when toggling placement with autoHide already loaded
	dispatch(addonBar, { type: 'ChangedAddonBarPlacement', cancelable: false });
};

moduleAid.LOADMODULE = function() {
	// The add-on bar needs to be hidden when entering print preview mode
	PrintPreviewListener.__hideChrome = PrintPreviewListener._hideChrome;
	PrintPreviewListener.__showChrome = PrintPreviewListener._showChrome;
	PrintPreviewListener._hideChrome = function() {
		setAttribute(document.documentElement, 'PrintPreview', 'true');
		this.__hideChrome();
	};
	PrintPreviewListener._showChrome = function() {
		removeAttribute(document.documentElement, 'PrintPreview');
		this.__showChrome();
	};
	
	CustomizableUI.addListener(addonBarCustomized);
	
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
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('autoHide', toggleAutoHide);
	prefAid.unlisten('showPPs', toggleAutoHide);
	prefAid.unlisten('placement', toggleAutoHide);
	prefAid.unlisten('placement', togglePlacement);
	
	listenerAid.remove(window, 'beforecustomization', togglePlacement);
	listenerAid.remove(window, 'aftercustomization', togglePlacement);
	listenerAid.remove(window, 'beforecustomization', toggleAutoHide);
	listenerAid.remove(window, 'aftercustomization', toggleAutoHide);
	
	removeAttribute(addonBar, 'placement');
	
	moduleAid.unload('autoHide');
	moduleAid.unload('inURLBar');
	moduleAid.unload('inCorner');
	moduleAid.unload('placePP');
	moduleAid.unload('initAddonBar');
	moduleAid.unload('compatibilityFix/windowFixes');
	
	CustomizableUI.removeListener(addonBarCustomized);
	
	PrintPreviewListener._hideChrome = PrintPreviewListener.__hideChrome;
	PrintPreviewListener._showChrome = PrintPreviewListener.__showChrome;
	delete PrintPreviewListener.__hideChrome;
	delete PrintPreviewListener.__showChrome;
	
	removeAttribute(document.documentElement, 'PrintPreview');
};
