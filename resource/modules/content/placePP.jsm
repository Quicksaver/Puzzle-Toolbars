moduleAid.VERSION = '1.0.0';

this.handleFullScreen = function() {
	message('inFullScreen', !!document.mozFullScreenElement);
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(Scope, 'mozfullscreenchange', handleFullScreen);
};

moduleAid.UNLOADMODULE = function() {
	// these will be removed through listenerAid.clean(), calling them here would just cause an error, as the sandboxTools module wouldn't have been loaded at this point,
	// and it couldn't be loaded now (it would throw) because the resource handler has been removed already.
	//listenerAid.remove(Scope, 'mozfullscreenchange', handleFullScreen);
};
