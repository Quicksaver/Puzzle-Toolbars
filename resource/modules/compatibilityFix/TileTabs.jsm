// VERSION 1.1.0

this.__defineGetter__('XULBrowserWindow', function() { return window.XULBrowserWindow; });

Modules.LOADMODULE = function() {
	// to ensure TileTabsStatusText() is run everytime the status text is set, show/hide the corner toolbar so it doesn't cover the status text
	XULBrowserWindow._statusText = XULBrowserWindow.statusText;
	delete XULBrowserWindow.statusText;
	XULBrowserWindow.__defineGetter__('statusText', function() { return this._statusText; });
	XULBrowserWindow.__defineSetter__('statusText', function(v) {
		this._statusText = v;

		if(Prefs.corner_bar && self.corner) {
			toggleAttribute(corner.bar, 'statusHide', v);
			toggleAttribute(corner.PP, 'statusHide', v);
		}
	});
};

Modules.UNLOADMODULE = function() {
	delete XULBrowserWindow.statusText;
	XULBrowserWindow.statusText = XULBrowserWindow._statusText;
	delete XULBrowserWindow._statusText;
};
