moduleAid.VERSION = '1.1.2';

this.__defineGetter__('CustomizableUI', function() { return window.CustomizableUI; });
this.__defineGetter__('PrintPreviewListener', function() { return window.PrintPreviewListener; });

this.specialWidgets = ['separator', 'spring', 'spacer'];

this.trackSpecialWidgets = {
	onWidgetAdded: function(aId, aCurrentArea, aCurrentPosition) {
		if(aId.startsWith(objName+'-special-')) {
			var type = aId.split(objName+'-special-')[1];
			CustomizableUI.removeWidgetFromArea(aId);
			CustomizableUI.addWidgetToArea(type, aCurrentArea, aCurrentPosition);
		}
	}
};

moduleAid.LOADMODULE = function() {
	// The add-on bar needs to be hidden when entering print preview mode
	PrintPreviewListener.__hideChrome = PrintPreviewListener._hideChrome;
	PrintPreviewListener.__showChrome = PrintPreviewListener._showChrome;
	PrintPreviewListener._hideChrome = function() {
		setAttribute(document.documentElement, 'PrintPreview', 'true');
		this.__hideChrome();
	};
	PrintPreviewListener._showChrome = function() {
		removeAttribute(document.documentElement, 'PrintPreview');
		this.__showChrome();
	};
	
	// Make sure our special widgets aren't actually appended anywhere, they are just placeholders
	CustomizableUI.addListener(trackSpecialWidgets);
	
	for(var i=0; i<specialWidgets.length; i++) {
		CustomizableUI.removeWidgetFromArea(objName+'-special-'+specialWidgets[i]);
	}
	
	// since we're starting with this australis-specific module, we Load the rest of the add-on here after everything
	moduleAid.load(objName);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload(objName);
	
	CustomizableUI.removeListener(trackSpecialWidgets);
	
	PrintPreviewListener._hideChrome = PrintPreviewListener.__hideChrome;
	PrintPreviewListener._showChrome = PrintPreviewListener.__showChrome;
	delete PrintPreviewListener.__hideChrome;
	delete PrintPreviewListener.__showChrome;
	
	removeAttribute(document.documentElement, 'PrintPreview');
};
