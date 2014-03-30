moduleAid.VERSION = '1.2.5';

this.__defineGetter__('oldBar', function() { return $('addon-bar'); });
this.__defineGetter__('PrintPreviewListener', function() { return window.PrintPreviewListener; });

this.barBackups = {};
this.oldBarMigrated = false;

this.migrateBackWidgets = function() {
	var migratedSet = oldBar.getMigratedItems();
	if(!migratedSet.length) { return; }
	
	oldBarMigrated = true;
	
	for(var i=0; i<migratedSet.length; i++) {
		try {
			var placement = CustomizableUI.getPlacementOfWidget(migratedSet[i]);
			if(!placement || placement.area == barBackups.delegate) {
				CustomizableUI.addWidgetToArea(migratedSet[i], objName+'-addon-bar');
			}
		}
		catch(ex) { Cu.reportError(ex); } // Make sure we don't block the code if something happens here
	}
	oldBar._currentSetMigrated.clear();
	oldBar._updateMigratedSet();
	
	dispatch(window, { type: 'MigratedFromAddonBar', cancelable: false });
};

this.toggleStatusBar = function() {
	$(objName+'-status-bar-container').hidden = !prefAid.statusBar;
};

this.addonBarCustomized = {
	onWidgetAdded: function(aWidget, aArea) { this.listener(aWidget, aArea); },
	onWidgetRemoved: function(aWidget, aArea) { this.listener(aWidget, aArea); },
	listener: function(aWidget, aArea) {
		if(aArea == addonBar.id && !trueAttribute(addonBar, 'customizing')) {
			dispatch(addonBar, { type: 'AddonBarCustomized', cancelable: false });
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
	
	// Delegate the old add-on bar into ours
	barBackups = {
		delegate: oldBar._delegatingToolbar,
		collapsed: oldBar._wasCollapsed
	};
	setAttribute(oldBar, 'toolbar-delegate', objName+'-addon-bar');
	oldBar._delegatingToolbar = objName+'-addon-bar';
	oldBar._wasCollapsed = false;
	
	oldBar._insertItem = oldBar.insertItem;
	oldBar._evictNodes = oldBar.evictNodes;
	oldBar.insertItem = function(aId, aBeforeElt, aWrapper) {
		this._insertItem(aId, aBeforeElt, aWrapper);
		migrateBackWidgets();
	};
	oldBar.evictNodes = function() {
		this._evictNodes();
		migrateBackWidgets();
	};
	
	// Migrate back already migrated items
	migrateBackWidgets();
	
	prefAid.listen('statusBar', toggleStatusBar);
	toggleStatusBar();
	
	CustomizableUI.addListener(addonBarCustomized);
	
	// since we're starting with this australis-specific module, we Load the rest of the add-on here after everything
	moduleAid.load(objName);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload(objName);
	
	CustomizableUI.removeListener(addonBarCustomized);
	
	prefAid.unlisten('statusBar', toggleStatusBar);
	
	setAttribute(oldBar, 'toolbar-delegate', barBackups.delegate);
	oldBar._delegatingToolbar = barBackups.delegate;
	oldBar._wasCollapsed = barBackups.collapsed;
	oldBar.insertItem = oldBar._insertItem;
	oldBar.evictNodes = oldBar._evictNodes;
	delete oldBar._insertItem;
	delete oldBar._evictNodes;
	
	PrintPreviewListener._hideChrome = PrintPreviewListener.__hideChrome;
	PrintPreviewListener._showChrome = PrintPreviewListener.__showChrome;
	delete PrintPreviewListener.__hideChrome;
	delete PrintPreviewListener.__showChrome;
	
	removeAttribute(document.documentElement, 'PrintPreview');
};
