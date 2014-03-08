moduleAid.VERSION = '1.0.0';

this.TileTabsStatusText = function() {
	var field = gBrowser.getStatusPanel();
	toggleAttribute(activePP, 'statusHide', field.label && prefAid.placement == 'corner');
	toggleAttribute(addonBar, 'statusHide', field.label && prefAid.placement == 'corner');
};

moduleAid.LOADMODULE = function() {
	toCode.modify(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField', [
		['field.label = text;', 'field.label = text; TileTabsStatusText();']
	]);
};

moduleAid.UNLOADMODULE = function() {
	toCode.revert(window.XULBrowserWindow, 'window.XULBrowserWindow.updateStatusField');
};
