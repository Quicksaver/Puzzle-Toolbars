moduleAid.VERSION = '1.0.2';

moduleAid.LOADMODULE = function() {
	this.backups = {
		updateWindowResizers: window.gBrowser.updateWindowResizers
	};
	window.gBrowser.updateWindowResizers = function updateWindowResizers() {
		if(!window.gShowPageResizers) { return; }
		
		var show = window.windowState == window.STATE_NORMAL;
		for (let i=0; i<this.browsers.length; i++) {
			this.browsers[i].showWindowResizer = show;
		}
	};
	
	window.gBrowser.updateWindowResizers();
};

moduleAid.UNLOADMODULE = function() {
	if(this.backups) {
		window.gBrowser.updateWindowResizers = this.backups.updateWindowResizers;
	}
	
	window.gBrowser.updateWindowResizers();
};
