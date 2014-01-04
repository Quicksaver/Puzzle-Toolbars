var defaultsVersion = '1.1.0';
var objName = 'thePuzzlePiece';
var objPathString = 'thepuzzlepiece';
var prefList = {
	movetoRight: true,
	autoHide: false,
	placement: 'bottom',
	
	/* hidden preference to not show the addon bar autohiding on startup */
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

function startAddon(window) {
	prepareObject(window);
	
	// Prevent things from jumping around on startup
	window.document.getElementById('addon-bar').hidden = true;
	
	window[objName].moduleAid.load(objName, true);
}

function stopAddon(window) {
	removeObject(window);
}

function startPreferences(window) {
	replaceObjStrings(window.document);
	preparePreferences(window);
	window[objName].moduleAid.load('options');
}

function startConditions(aReason) {
	return true;
}

function onStartup(aReason) {
	moduleAid.load('keysets');
	
	// Apply the add-on to every window opened and to be opened
	windowMediator.callOnAll(startAddon, 'navigator:browser');
	windowMediator.register(startAddon, 'domwindowopened', 'navigator:browser');
	
	// Apply the add-on to every preferences window opened and to be opened
	windowMediator.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	windowMediator.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown(aReason) {
	// Placing these here prevents an error which I couldn't figure out why the closeCustomize() in overlayAid weren't already preventing.
	closeCustomize();
	
	// remove the add-on from all windows
	windowMediator.callOnAll(stopAddon, null, null, true);
	
	moduleAid.unload('keysets');
}
