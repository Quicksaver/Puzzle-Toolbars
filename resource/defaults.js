var defaultsVersion = '1.0.2';
var objName = 'thePuzzlePiece';
var objPathString = 'thepuzzlepiece';
var prefList = {
	movetoRight: true
};

function startAddon(window) {
	prepareObject(window);
	window[objName].moduleAid.load(objName, true);
}

function stopAddon(window) {
	removeObject(window);
}

function startConditions(aReason) {
	return true;
}

function onStartup(aReason) {
	// Apply the add-on to every window opened and to be opened
	windowMediator.callOnAll(startAddon, 'navigator:browser');
	windowMediator.register(startAddon, 'domwindowopened', 'navigator:browser');
}

function onShutdown(aReason) {
	// Placing these here prevents an error which I couldn't figure out why the closeCustomize() in overlayAid weren't already preventing.
	closeCustomize();
	
	// remove the add-on from all windows
	windowMediator.callOnAll(stopAddon, null, null, true);
}
