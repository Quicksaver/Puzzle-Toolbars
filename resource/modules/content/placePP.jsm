moduleAid.VERSION = '1.0.1';

this.handleFullScreen = function() {
	message('inFullScreen', !!document.mozFullScreenElement);
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(Scope, 'mozfullscreenchange', handleFullScreen);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(Scope, 'mozfullscreenchange', handleFullScreen);
};
