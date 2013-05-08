moduleAid.VERSION = '1.0.1';

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
	
	setAttribute($('main-window'), objName+'-oscpu', 'Windows NT 5.1');
	
	window.gBrowser.updateWindowResizers();
};

moduleAid.UNLOADMODULE = function() {
	removeAttribute($('main-window'), objName+'-oscpu', 'Windows NT 5.1');
	
	if(this.backups) {
		window.gBrowser.updateWindowResizers = this.backups.updateWindowResizers;
	}
	
	window.gBrowser.updateWindowResizers();
};
