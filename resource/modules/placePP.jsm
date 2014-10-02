moduleAid.VERSION = '2.0.1';

this.commandPP = function(e, button) {
	if(e.button != 0) { return; }
	toggleBar(button._bar.id);
	dispatch(button, { type: 'ToggledPuzzleBarThroughButton', cancelable: false });
};

this.activatePPs = function(e) {
	toggleAttribute(e.target._pp, 'active', !e.target.collapsed);
};

this.handleFullScreen = function(m) {
	setAttribute(document.documentElement, objName+'-noAnimation', 'true');
	toggleAttribute(document.documentElement, objName+'-fullscreen', m.data);
	aSync(function() {
		removeAttribute(document.documentElement, objName+'-noAnimation');
	});
};

moduleAid.LOADMODULE = function() {
	messenger.loadInWindow(window, 'placePP');
	messenger.listenWindow(window, 'inFullScreen', handleFullScreen);
	
	listenerAid.add(window, 'ToggledPuzzleBar', activatePPs);
	listenerAid.add(window, 'LoadedPuzzleBar', activatePPs);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'ToggledPuzzleBar', activatePPs);
	listenerAid.remove(window, 'LoadedPuzzleBar', activatePPs);
	
	messenger.unlistenWindow(window, 'inFullScreen', handleFullScreen);
	messenger.unloadFromWindow(window, 'placePP');
};
