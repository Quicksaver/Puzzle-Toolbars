var defaultsVersion = '1.3.0';
var objName = 'thePuzzlePiece';
var objPathString = 'thepuzzlepiece';
var prefList = {
	movetoRight: true,
	autoHide: false,
	placement: 'bottom',
	statusBar: true,
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

function startAddon(window) {
	prepareObject(window);
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
	moduleAid.load('australisSandbox');
	
	// Apply the add-on to every preferences window opened and to be opened
	windowMediator.callOnAll(startPreferences, null, "chrome://"+objPathString+"/content/options.xul");
	windowMediator.register(startPreferences, 'domwindowopened', null, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.callOnAll(startPreferences, "chrome://"+objPathString+"/content/options.xul");
	browserMediator.register(startPreferences, 'pageshow', "chrome://"+objPathString+"/content/options.xul");
}

function onShutdown(aReason) {
	moduleAid.unload('australisSandbox');
	moduleAid.unload('keysets');
}
