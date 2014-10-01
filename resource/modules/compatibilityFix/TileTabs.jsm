moduleAid.VERSION = '1.0.1';

this.TileTabsStatusText = function() {
	if(!prefAid.corner_bar || typeof(cornerBar) == 'undefined') { return; }
	
	var field = gBrowser.getStatusPanel();
	toggleAttribute(cornerBar, 'statusHide', field.label);
};

moduleAid.LOADMODULE = function() {
	toCode.modify(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField', [
		['field.label = text;', 'field.label = text; TileTabsStatusText();']
	]);
};

moduleAid.UNLOADMODULE = function() {
	toCode.revert(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField');
};
