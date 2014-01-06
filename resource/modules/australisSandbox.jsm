moduleAid.VERSION = '1.0.0';

this.CustomizableUI = null;

this.specialWidgets = ['separator', 'spring', 'spacer'];

this.trackSpecialWidgets = {
	onWidgetAdded: function(aId, aCurrentArea, aCurrentPosition) {
		if(aId.startsWith(objName+'-special-')) {
			var type = aId.split(objName+'-special-')[1];
			CustomizableUI.removeWidgetFromArea(aId);
			CustomizableUI.addWidgetToArea(type, aCurrentArea, aCurrentPosition);
			
			// Note: not setting WIDE_PANEL_CLASS to these widgets, in case they are inserted in the menu-panel,
			// so they can be more accuratelly placed.
		}
	}
};

moduleAid.LOADMODULE = function() {
	var scope = {};
	Cu.import("resource:///modules/CustomizableUI.jsm", scope);
	CustomizableUI = scope.CustomizableUI;

	// Make sure our special widgets aren't actually appended anywhere, they are just placeholders
	CustomizableUI.addListener(trackSpecialWidgets);
	
	for(var i=0; i<specialWidgets.length; i++) {
		CustomizableUI.removeWidgetFromArea(objName+'-special-'+specialWidgets[i]);
	}
	
	overlayAid.overlayURI('chrome://browser/content/browser.xul', 'australisBar', null,
		function(aWindow) {
			moduleAid.load('compatibilityFix/sandboxFixes'); // We need our add-on bar registered for this
			startAddon(aWindow);
		},
		function(aWindow) { stopAddon(aWindow); }
	);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/sandboxFixes');
	
	overlayAid.removeOverlayURI('chrome://browser/content/browser.xul', 'australisBar');
	
	CustomizableUI.removeListener(trackSpecialWidgets);
};
