moduleAid.VERSION = '1.0.3';

moduleAid.LOADMODULE = function() {
	this.backups = {
		updateWindowResizers: gBrowser.updateWindowResizers
	};
	gBrowser.updateWindowResizers = function updateWindowResizers() {
		if(!window.gShowPageResizers) { return; }
		
		var show = window.windowState == window.STATE_NORMAL;
		for (let i=0; i<this.browsers.length; i++) {
			this.browsers[i].showWindowResizer = show;
		}
	};
	
	gBrowser.updateWindowResizers();
};

moduleAid.UNLOADMODULE = function() {
	if(this.backups) {
		gBrowser.updateWindowResizers = this.backups.updateWindowResizers;
	}
	
	gBrowser.updateWindowResizers();
};
