Modules.VERSION = '2.0.3';

this.StatusBar = {
	// don't forget that add-ons that use the status-bar seem to assume it is always in the DOM tree!
	onWidgetAdded: function(aWidgetId, aArea) { this.handleContainer(aWidgetId, aArea); },
	onWidgetRemoved: function(aWidgetId) { this.handleContainer(aWidgetId); },
	
	onAreaNodeRegistered: function(aArea, aContainer) {
		// wait for the node to be appended to the DOM before checking it for the status bar
		this.waitForArea(aContainer.ownerDocument.defaultView, aArea);
	},
	
	onAreaNodeUnregistered: function(aArea, aContainer, aReason) {
		if(aReason == CustomizableUI.REASON_AREA_UNREGISTERED) {
			this.move(aContainer.ownerDocument.defaultView);
		}
	},
	
	// move the status bar onto our container
	prepare: function(aWindow) {
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
		
		this.move(aWindow);
	},
	
	// move the status bar onto our container
	move: function(aWindow) {
		if(aWindow.closed || aWindow.willClose || !aWindow[objName]) { return; }
		
		if(!CustomizableUI.getPlacementOfWidget(objName+'-status-bar-container')) {
			this.restore(aWindow);
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
			Windows.callOnAll(function(bWindow) {
				if(!bWindow[objName]) {
					bWindow[objName+'__statusBar'] = bWindow.document.getElementById('status-bar');
				}
			}, 'navigator:browser');
			
			CustomizableUI.removeWidgetFromArea('status-bar');
			
			// because when we do the above command, the node is physically removed from all windows, we have to put it back
			Windows.callOnAll((cWindow) => {
				if(!cWindow[objName]) { return; }
				this.moveNode(cWindow);
			}, 'navigator:browser');
		}
		// this should happen when enabling the add-on on a second window, that was already opened when we called removeWidgetFromArea above
		else {
			this.moveNode(aWindow);
		}
	},
	// moveAllStatusBars
	moveAll: function() {
		Windows.callOnAll((cWindow) => {
			if(!cWindow[objName]) { return; }
			this.move(cWindow);
		}, 'navigator:browser');
	},
	
	moveNode: function(aWindow) {
		var sStack = aWindow.document.getElementById(objName+'-status-bar-stack');
		
		// I have no idea how this is possible, but it happens when disabling and re-enabling the add-on...
		if(!sStack) { return; }
		
		if(!aWindow[objName] || !aWindow[objName]._statusBar || aWindow[objName]._statusBar.node.parentNode == sStack) { return; }
		
		sStack.insertBefore(aWindow[objName]._statusBar.node, sStack.firstChild);
	},
	
	restore: function(aWindow) {
		if(aWindow[objName] && aWindow[objName]._statusBar.originalParent) {
			var sBar = aWindow.document.getElementById('status-bar') || aWindow[objName]._statusBar.node;
			if(aWindow[objName]._statusBar.originalParent != sBar.parentNode) { aWindow[objName]._statusBar.originalParent.appendChild(sBar); }
			if(aWindow[objName]._statusBar.originalRemovable) { setAttribute(sBar, 'removable', aWindow[objName]._statusBar.originalRemovable); }
			aWindow[objName]._statusBar.originalParent = null;
			aWindow[objName]._statusBar.originalRemovable = null;
		}
	},
	
	handleContainer: function(aWidgetId, aArea) {
		if(aWidgetId == objName+'-status-bar-container') {
			if(aArea && aArea == CustomizableUI.AREA_PANEL) {
				CustomizableUI.removeWidgetFromArea(aWidgetId);
				return;
			}
			this.moveAll();
		}
	},
	
	waitForArea: function(aWindow, aArea) {
		if(!aWindow.document.getElementById(aArea)) {
			aSync(() => {
				if(UNLOADED) { return; }
				
				try { this.waitForArea(aWindow, aArea); }
				catch(ex) { Cu.reportError(ex); }
			});
			return;
		}
		this.move(aWindow);
	},
	
	// see https://bugzilla.mozilla.org/show_bug.cgi?id=989338
	// that bug has been fixed for a while, I don't think this is needed anymore,
	// I'll give it a test-removal, will actually remove by FF43 if I get no complaints
	/*preventLosingCustomizeData: function() {
		Windows.callOnAll((aWindow) => {
			this.restore(aWindow);
		}, 'navigator:browser');
		
		try { CustomizableUI.addWidgetToArea('status-bar', 'addon-bar'); }
		catch(ex) {}
	},*/
	
	onLoad: function(aWindow) {
		if(!aWindow.document.documentElement.getAttribute('chromehidden').includes('toolbar')) {
			prepareObject(aWindow);
			this.prepare(aWindow);
		}
	},
	
	onUnload: function(aWindow) {
		this.restore(aWindow);
		removeObject(aWindow);
	}
};

Modules.LOADMODULE = function() {
	//alwaysRunOnShutdown.push(StatusBar.preventLosingCustomizeData);
	
	CustomizableUI.addListener(StatusBar);
	
	Overlays.overlayURI('chrome://browser/content/browser.xul', 'statusBar', StatusBar);
	
	Overlays.overlayURI('chrome://'+objPathString+'/content/statusBar.xul', objName, {
		onLoad: function(aWindow) {
			if(aWindow[objName]) {
				aWindow[objName].Modules.load(objName, true);
			}
		},
		onUnload: function(aWindow) {
			if(aWindow[objName]) {
				aWindow[objName].Modules.unload(objName);
			}
		}
	});
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/statusBar.xul', objName);
	Overlays.removeOverlayURI('chrome://browser/content/browser.xul', 'statusBar');
	
	CustomizableUI.removeListener(StatusBar);
	
	//StatusBar.preventLosingCustomizeData();
};
