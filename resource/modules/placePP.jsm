Modules.VERSION = '2.0.2';

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

Modules.LOADMODULE = function() {
	Messenger.loadInWindow(window, 'placePP');
	Messenger.listenWindow(window, 'inFullScreen', handleFullScreen);
	
	Listeners.add(window, 'ToggledPuzzleBar', activatePPs);
	Listeners.add(window, 'LoadedPuzzleBar', activatePPs);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'ToggledPuzzleBar', activatePPs);
	Listeners.remove(window, 'LoadedPuzzleBar', activatePPs);
	
	Messenger.unlistenWindow(window, 'inFullScreen', handleFullScreen);
	Messenger.unloadFromWindow(window, 'placePP');
};
