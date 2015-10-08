// VERSION 1.0.3

this.TileTabsStatusText = function() {
	if(!Prefs.corner_bar || typeof(corner) == 'undefined') { return; }
	
	var field = gBrowser.getStatusPanel();
	toggleAttribute(corner.bar, 'statusHide', field.label);
};

Modules.LOADMODULE = function() {
	toCode.modify(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField', [
		// to ensure TileTabsStatusText() is run everytime the status text is set, to show/hide the corner toolbar appropriately so it doesn't hide the status text
		['field.label = text;', 'field.label = text; TileTabsStatusText();']
	]);
};

Modules.UNLOADMODULE = function() {
	toCode.revert(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField');
};
