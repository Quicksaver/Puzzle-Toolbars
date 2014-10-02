var defaultsVersion = '1.5.3';
var objName = 'puzzleBars';
var objPathString = 'puzzlebars';
var prefList = {
	bottom_bar: true,
	bottom_pp: true,
	bottom_right: false,
	bottom_keycode: '/',
	bottom_accel: true,
	bottom_shift: false,
	bottom_alt: false,
	
	corner_bar: false,
	corner_pp: true,
	corner_right: true,
	corner_autohide: true,
	corner_extend: false,
	corner_keycode: 'VK_F2',
	corner_accel: false,
	corner_shift: false,
	corner_alt: false,
	
	urlbar_bar: false,
	urlbar_pp: true,
	urlbar_autohide: true,
	urlbar_whenfocused: false,
	urlbar_keycode: 'none',
	urlbar_accel: false,
	urlbar_shift: false,
	urlbar_alt: false,
	
	// for migrateLegacy, probably safe to remove in the future, see note in that module
	migratedLegacy: false,
	
	// hidden preference to not show the addon bar autohiding on startup
	noInitialShow: false
};

function stopAddon(window) {
	removeObject(window);
}

function startPreferences(window) {
	replaceObjStrings(window.document);
	preparePreferences(window);
	window[objName].moduleAid.load('options');
}

function onStartup() {
	moduleAid.load('compatibilityFix/sandboxFixes');
	moduleAid.load('specialWidgets');
	moduleAid.load('migrateLegacy');
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
	moduleAid.unload('migrateLegacy');
	moduleAid.unload('specialWidgets');
	moduleAid.unload('compatibilityFix/sandboxFixes');
}
