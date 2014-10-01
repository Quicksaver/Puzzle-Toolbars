moduleAid.VERSION = '1.1.0';

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
	
	if(!CustomizableUI.getPlacementOfWidget(objName+'-status-bar-container')) {
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

// don't forget that add-ons that use the status-bar seem to assume it is always in the DOM tree!
this.trackStatusBar = {
	handler: function(aWidgetId, aArea) {
		if(aWidgetId == objName+'-status-bar-container') {
			if(aArea && aArea == CustomizableUI.AREA_PANEL) {
				CustomizableUI.removeWidgetFromArea(aWidgetId);
				return;
			}
			moveAllStatusBars();
		}
	},
	
	onWidgetAdded: function(aWidgetId, aArea) { this.handler(aWidgetId, aArea); },
	onWidgetRemoved: function(aWidgetId) { this.handler(aWidgetId); }
};

moduleAid.LOADMODULE = function() {
	alwaysRunOnShutdown.push(preventLosingCustomizeData);
	
	CustomizableUI.addListener(trackStatusBar);
	
	overlayAid.overlayURI('chrome://browser/content/browser.xul', 'statusBar', null,
		function(aWindow) {
			prepareObject(aWindow);
			prepareStatusBar(aWindow);
		},
		function(aWindow) {
			moveStatusBarBack(aWindow);
			removeObject(aWindow);
		}
	);
	
	overlayAid.overlayURI('chrome://'+objPathString+'/content/statusBar.xul', objName, null,
		function(aWindow) {
			aWindow[objName].moduleAid.load(objName, true);
		},
		function(aWindow) {
			aWindow[objName].moduleAid.unload(objName);
		}
	);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/statusBar.xul', objName);
	overlayAid.removeOverlayURI('chrome://browser/content/browser.xul', 'statusBar');
	
	CustomizableUI.removeListener(trackStatusBar);
	
	preventLosingCustomizeData();
};
