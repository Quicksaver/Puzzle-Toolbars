moduleAid.VERSION = '1.0.2';

this.__defineGetter__('gBrowser', function() { return window.gBrowser; });

this.__defineGetter__('customizing', function() {
	if(trueAttribute(document.documentElement, 'customizing')) { return true; }
	
	// this means that the window is still opening and the first tab will open customize mode
	if(gBrowser.mCurrentBrowser
	&& gBrowser.mCurrentBrowser.__SS_restore_data
	&& gBrowser.mCurrentBrowser.__SS_restore_data.url == 'about:customizing') {
		return true;
	}
	
	return false;
});

this.toggleBottom = function() {
	moduleAid.loadIf('bottom', prefAid.bottom_bar);
};

this.toggleCorner = function() {
	moduleAid.loadIf('corner', prefAid.corner_bar);
};

this.toggleUrlbar = function() {
	moduleAid.loadIf('urlbar', prefAid.urlbar_bar);
};

this.toggleLateral = function() {
	moduleAid.loadIf('lateral', prefAid.lateral_bar);
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	moduleAid.load('initAddonBar');
	moduleAid.load('placePP');
	moduleAid.load('autoHide');
	
	prefAid.listen('bottom_bar', toggleBottom);
	prefAid.listen('corner_bar', toggleCorner);
	prefAid.listen('urlbar_bar', toggleUrlbar);
	prefAid.listen('lateral_bar', toggleLateral);
	
	toggleBottom();
	toggleCorner();
	toggleLateral();
	toggleUrlbar();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('bottom_bar', toggleBottom);
	prefAid.unlisten('corner_bar', toggleCorner);
	prefAid.unlisten('urlbar_bar', toggleUrlbar);
	prefAid.unlisten('lateral_bar', toggleLateral);
	
	moduleAid.unload('urlbar');
	moduleAid.unload('lateral');
	moduleAid.unload('corner');
	moduleAid.unload('bottom');
	moduleAid.unload('autoHide');
	moduleAid.unload('placePP');
	moduleAid.unload('initAddonBar');
	moduleAid.unload('compatibilityFix/windowFixes');
};
