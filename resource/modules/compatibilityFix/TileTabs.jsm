moduleAid.VERSION = '1.0.1';

this.TileTabsStatusText = function() {
	if(!prefAid.corner_bar || typeof(cornerBar) == 'undefined') { return; }
	
	var field = gBrowser.getStatusPanel();
	toggleAttribute(cornerBar, 'statusHide', field.label);
};

moduleAid.LOADMODULE = function() {
	toCode.modify(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField', [
		// to ensure TileTabsStatusText() is run everytime the status text is set, to show/hide the corner toolbar appropriately so it doesn't hide the status text
		['field.label = text;', 'field.label = text; TileTabsStatusText();']
	]);
};

moduleAid.UNLOADMODULE = function() {
	toCode.revert(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField');
};
