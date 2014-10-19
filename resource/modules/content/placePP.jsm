Modules.VERSION = '1.0.2';

this.handleFullScreen = function() {
	message('inFullScreen', !!document.mozFullScreenElement);
};

Modules.LOADMODULE = function() {
	Listeners.add(Scope, 'mozfullscreenchange', handleFullScreen);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(Scope, 'mozfullscreenchange', handleFullScreen);
};
