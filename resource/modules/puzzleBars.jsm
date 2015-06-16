Modules.VERSION = '1.0.8';

this.__defineGetter__('gBrowser', function() { return window.gBrowser; });

this.possibleBars = [
	objName+'-bottom-bar',
	objName+'-corner-bar',
	objName+'-lateral-bar',
	objName+'-top-bar',
	objName+'-urlbar-bar'
];

this.openOptions = function() {
	PrefPanes.open(window);
};

this.toggleBottom = function() {
	Modules.loadIf('bottom', Prefs.bottom_bar);
};

this.toggleCorner = function() {
	Modules.loadIf('corner', Prefs.corner_bar);
};

this.toggleUrlbar = function() {
	Modules.loadIf('urlbar', Prefs.urlbar_bar);
};

this.toggleLateral = function() {
	Modules.loadIf('lateral', Prefs.lateral_bar);
};

this.toggleTop = function() {
	Modules.loadIf('top', Prefs.top_bar);
};

Modules.LOADMODULE = function() {
	Modules.load('compatibilityFix/windowFixes');
	Modules.load('initAddonBar');
	Modules.load('placePP');
	Modules.load('autoHide');
	
	Prefs.listen('bottom_bar', toggleBottom);
	Prefs.listen('corner_bar', toggleCorner);
	Prefs.listen('urlbar_bar', toggleUrlbar);
	Prefs.listen('lateral_bar', toggleLateral);
	Prefs.listen('top_bar', toggleTop);
	
	toggleBottom();
	toggleCorner();
	toggleLateral();
	toggleTop();
	toggleUrlbar();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('bottom_bar', toggleBottom);
	Prefs.unlisten('corner_bar', toggleCorner);
	Prefs.unlisten('urlbar_bar', toggleUrlbar);
	Prefs.unlisten('lateral_bar', toggleLateral);
	Prefs.unlisten('top_bar', toggleTop);
	
	Modules.unload('urlbar');
	Modules.unload('top');
	Modules.unload('lateral');
	Modules.unload('corner');
	Modules.unload('bottom');
	Modules.unload('autoHide');
	Modules.unload('placePP');
	Modules.unload('initAddonBar');
	Modules.unload('compatibilityFix/windowFixes');
};
