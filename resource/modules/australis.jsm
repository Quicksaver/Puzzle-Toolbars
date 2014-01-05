moduleAid.VERSION = '1.0.0';

this.__defineGetter__('CustomizableUI', function() { return window.CustomizableUI; });
this.__defineGetter__('PrintPreviewListener', function() { return window.PrintPreviewListener; });

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
	
	moduleAid.load(objName);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload(objName);
	
	PrintPreviewListener._hideChrome = PrintPreviewListener.__hideChrome;
	PrintPreviewListener._showChrome = PrintPreviewListener.__showChrome;
	delete PrintPreviewListener.__hideChrome;
	delete PrintPreviewListener.__showChrome;
	
	removeAttribute(document.documentElement, 'PrintPreview');
};
