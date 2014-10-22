Modules.VERSION = '2.0.3';

this.commandPP = function(e, button) {
	if(e.button != 0) { return; }
	toggleBar(button._bar.id);
	dispatch(button, { type: 'ToggledPuzzleBarThroughButton', cancelable: false });
};

this.activatePPs = function(e) {
	toggleAttribute(e.target._pp, 'active', !e.target.collapsed);
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'ToggledPuzzleBar', activatePPs);
	Listeners.add(window, 'LoadedPuzzleBar', activatePPs);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'ToggledPuzzleBar', activatePPs);
	Listeners.remove(window, 'LoadedPuzzleBar', activatePPs);
};
