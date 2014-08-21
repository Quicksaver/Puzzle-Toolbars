moduleAid.VERSION = '1.2.1';

this.CustomizableUI = null;

this.specialWidgets = ['separator', 'spring', 'spacer'];

this.trackSpecialWidgets = {
	onWidgetAdded: function(aId, aCurrentArea, aCurrentPosition) {
		if(aId.startsWith(objName+'-special-')) {
			var type = aId.split(objName+'-special-')[1];
			CustomizableUI.removeWidgetFromArea(aId);
			
			if(type != 'spring' || aCurrentArea != 'nav-bar') {
				CustomizableUI.addWidgetToArea(type, aCurrentArea, aCurrentPosition);
			}
			
			// Note: not setting WIDE_PANEL_CLASS to these widgets, in case they are inserted in the menu-panel,
			// so they can be more accuratelly placed.
		}
	}
};

// move the status bar onto our container
this.prepareStatusBar = function(aWindow) {
	if(aWindow.closed || aWindow.willClose) { return; }
	
	var sBar = aWindow.document.getElementById('status-bar') || aWindow[objName+'__statusBar'] || aWindow[objName]._statusBar.node;
	delete aWindow[objName+'__statusBar'];
	if(!sBar) {
		sBar = aWindow.document.getElementById('navigator-toolbox').palette.getElementsByAttribute('id', 'status-bar')[0];
	}
	
	if(!aWindow[objName]._statusBar) {
		aWindow[objName]._statusBar = {
			node: sBar,
			originalParent: null,
			originalRemovable: null
		};
	}
	
	moveStatusBar(aWindow);
};
	
// move the status bar onto our container
this.moveStatusBar = function(aWindow) {
	if(aWindow.closed || aWindow.willClose) { return; }
	
	var sContainer = aWindow.document.getElementById(objName+'-status-bar-container');
	sContainer.hidden = !prefAid.statusBar;
	
	if(!prefAid.statusBar) {
		moveStatusBarBack(aWindow);
		return;
	}
	
	var sBar = aWindow.document.getElementById('status-bar') || aWindow[objName]._statusBar.node;
	var sStack = aWindow.document.getElementById(objName+'-status-bar-stack');
	if(!sBar || sBar.parentNode == sStack) { return; }
	
	aWindow[objName]._statusBar.originalParent = sBar.parentNode;
	aWindow[objName]._statusBar.originalRemovable = sBar.getAttribute('removable');
	
	setAttribute(sBar, 'removable', 'true');
	if(CustomizableUI.getWidget('status-bar').areaType) {
		// in case we haven't yet enabled the add-on in other windows, we have to keep a reference to the status bar node,
		// otherwise we'll lose it when we continue. This will be deleted once the add-on is enabled there.
		windowMediator.callOnAll(function(bWindow) {
			if(!bWindow[objName]) {
				bWindow[objName+'__statusBar'] = bWindow.document.getElementById('status-bar');
			}
		}, 'navigator:browser');
		
		CustomizableUI.removeWidgetFromArea('status-bar');
		
		// because when we do the above command, the node is physically removed from all windows, we have to put it back
		windowMediator.callOnAll(function(cWindow) {
			if(!cWindow[objName]) { return; }
			moveStatusBarNode(cWindow);
		}, 'navigator:browser');
	} else {
		// this should happen when enabling the add-on on a second window, that was already opened when we called removeWidgetFromArea above
		moveStatusBarNode(aWindow);
	}
};

this.moveAllStatusBars = function() {
	windowMediator.callOnAll(function(cWindow) {
		if(!cWindow[objName]) { return; }
		moveStatusBar(cWindow);
	}, 'navigator:browser');
};

this.moveStatusBarNode = function(aWindow) {
	var sStack = aWindow.document.getElementById(objName+'-status-bar-stack');
	if(!aWindow[objName] || !aWindow[objName]._statusBar || aWindow[objName]._statusBar.node.parentNode == sStack) { return; }
	
	sStack.insertBefore(aWindow[objName]._statusBar.node, sStack.firstChild);
};

this.moveStatusBarBack = function(aWindow) {
	if(aWindow[objName] && aWindow[objName]._statusBar.originalParent) {
		var sBar = aWindow.document.getElementById('status-bar') || aWindow[objName]._statusBar.node;
		if(aWindow[objName]._statusBar.originalParent != sBar.parentNode) { aWindow[objName]._statusBar.originalParent.appendChild(sBar); }
		if(aWindow[objName]._statusBar.originalRemovable) { setAttribute(sBar, 'removable', aWindow[objName]._statusBar.originalRemovable); }
		aWindow[objName]._statusBar.originalParent = null;
		aWindow[objName]._statusBar.originalRemovable = null;
	}
};

// see https://bugzilla.mozilla.org/show_bug.cgi?id=989338
this.preventLosingCustomizeData = function() {
	windowMediator.callOnAll(function(aWindow) {
		moveStatusBarBack(aWindow);
	}, 'navigator:browser');
	try { CustomizableUI.addWidgetToArea('status-bar', 'addon-bar'); } catch(ex) {}
};

moduleAid.LOADMODULE = function() {
	var scope = {};
	Cu.import("resource:///modules/CustomizableUI.jsm", scope);
	CustomizableUI = scope.CustomizableUI;

	// Make sure our special widgets aren't actually appended anywhere, they are just placeholders
	CustomizableUI.addListener(trackSpecialWidgets);
	
	for(var i of specialWidgets) {
		CustomizableUI.removeWidgetFromArea(objName+'-special-'+i);
	}
	
	alwaysRunOnShutdown.push(preventLosingCustomizeData);
	
	prefAid.listen('statusBar', moveAllStatusBars);
	
	overlayAid.overlayURI('chrome://browser/content/browser.xul', 'australisBar', null,
		function(aWindow) {
			moduleAid.load('compatibilityFix/sandboxFixes'); // We need our add-on bar registered for this
			prepareObject(aWindow);
			
			prepareStatusBar(aWindow);
			aWindow[objName].moduleAid.load('australis', true);
		},
		function(aWindow) {
			moveStatusBarBack(aWindow);
			removeObject(aWindow);
		}
	);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/sandboxFixes');
	
	prefAid.unlisten('statusBar', moveAllStatusBars);
	
	overlayAid.removeOverlayURI('chrome://browser/content/browser.xul', 'australisBar');
	
	preventLosingCustomizeData();
	
	CustomizableUI.removeListener(trackSpecialWidgets);
};
