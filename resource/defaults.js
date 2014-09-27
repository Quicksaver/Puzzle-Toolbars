var defaultsVersion = '1.4.1';
var objName = 'thePuzzlePiece';
var objPathString = 'thepuzzlepiece';
var prefList = {
	movetoRight: true,
	autoHide: false,
	autoHideWhenFocused: false,
	placement: 'bottom',
	showPPs: true,
	
	// hidden preference to not show the addon bar autohiding on startup
	noInitialShow: false,
	
	addonBarKeycode: '/',
	addonBarAccel: true,
	addonBarShift: false,
	addonBarAlt: false,
	
	lwthemebgImage: '',
	lwthemebgWidth: 0,
	lwthemebgHeight: 0,
	lwthemecolor: '',
	lwthemebgColor: ''
};

// CustomizableUI will be imported in the specialWidgets module
var CustomizableUI = null;
var CUIBackstage = null;

function stopAddon(window) {
	removeObject(window);
}

function startPreferences(window) {
	replaceObjStrings(window.document);
	preparePreferences(window);
	window[objName].moduleAid.load('options');
}

function onStartup() {
	CUIBackstage = Cu.import("resource:///modules/CustomizableUI.jsm", self);
	
	moduleAid.load('compatibilityFix/sandboxFixes');
	moduleAid.load('keysets');
	moduleAid.load('specialWidgets');
	moduleAid.load('statusBar');
	
	// the add-on initialization is done inside the statusBar module so it can correctly handle the status-bar in all windows
	
	// Apply the add-on to every preferences window opened and to be opened
	windowMediator.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	windowMediator.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown() {
	// deinitialization is also don inside statusBar, just like above
	
	moduleAid.unload('statusBar');
	moduleAid.unload('specialWidgets');
	moduleAid.unload('keysets');
	moduleAid.unload('compatibilityFix/sandboxFixes');
}
