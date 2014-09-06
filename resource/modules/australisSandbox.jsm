moduleAid.VERSION = '1.3.1';

this.CustomizableUI = null;
this.CUIBackstage = null;
this.CUIInternalOriginal = null;

this.specialWidgets = ['separator', 'spring', 'spacer'];
this.ourSpecialWidgets = [];

this.addWidgetToArea = function(aWidgetId, aArea, aPosition, aInitialAdd) {
	if(aWidgetId.startsWith(objName+'-placeholder-')) {
		aWidgetId = aWidgetId.match(/spring|spacer|separator/)[0];
		
		if(aWidgetId == 'spring' && (aArea == CustomizableUI.AREA_NAVBAR || aArea == CustomizableUI.AREA_PANEL)) {
			return;
		}
	}
	
	if(aWidgetId.startsWith(objName+'-special-')) {
		if(aArea != CustomizableUI.AREA_PANEL) {
			this.removeWidgetFromArea(aWidgetId);
			destroyOurSpecialWidget(aWidgetId);
			aWidgetId = aWidgetId.match(/spring|spacer|separator/)[0];
		}
		else if(ourSpecialWidgets.indexOf(aWidgetId) == -1) {
			aWidgetId = createOurSpecialWidget(aWidgetId);
		}
	}
	
	if(this.isSpecialWidget(aWidgetId)) {
		if(aWidgetId.contains('spring') && (aArea == CustomizableUI.AREA_NAVBAR || aArea == CustomizableUI.AREA_PANEL)) {
			this.removeWidgetFromArea(aWidgetId);
			return;
		}
		
		if(aArea == CustomizableUI.AREA_PANEL) {
			var placement = this.getPlacementOfWidget(aWidgetId, true);
			if(placement && placement.area != aArea) {
				this.removeWidgetFromArea(aWidgetId);
			}
			
			var wId = createOurSpecialWidget(aWidgetId);
			return this._addWidgetToArea(wId, aArea, aPosition, aInitialAdd);
		}
	}
	
	return this._addWidgetToArea(aWidgetId, aArea, aPosition, aInitialAdd);
};

this.canWidgetMoveToArea = function(aWidgetId, aArea) {
	if(this.isSpecialWidget(aWidgetId)) {
		var placement = this.getPlacementOfWidget(aWidgetId);
		if((!placement || placement.area != aArea)
		&& CUIBackstage.gAreas.has(aArea) && CUIBackstage.gAreas.get(aArea).get("type") == CustomizableUI.TYPE_MENU_PANEL) {
			return true;
		}
		
		if(aWidgetId.contains('spring') && (aArea == CustomizableUI.AREA_NAVBAR || aArea == CustomizableUI.AREA_PANEL)) {
			return false;
		}
	}
	
	return this._canWidgetMoveToArea(aWidgetId, aArea);
};

this.buildArea = function(aArea, aPlacements, aAreaNode) {
	if(CUIBackstage.gUndoResetting && aArea == CustomizableUI.AREA_PANEL) {
		for(var wId of aPlacements) {
			if(wId.startsWith(objName+'-special-') && ourSpecialWidgets.indexOf(wId) == -1) {
				createOurSpecialWidget(wId);
			}
		}
	}
	
	this._buildArea(aArea, aPlacements, aAreaNode);
};

this.createOurSpecialWidget = function(aId) {
	var nodeType = aId.match(/spring|spacer|separator/)[0];
	var wId = aId;
	if(!wId.startsWith(objName+'-special-')) {
		wId = objName+'-special-'+nodeType+(++CUIBackstage.gNewElementCount);
	}
	
	CustomizableUI.createWidget({
		id: wId,
		type: 'custom',
		onBuild: function(aDoc) {
			var widget = CUIBackstage.CustomizableUIInternal.createSpecialWidget(nodeType, aDoc);
			widget.id = wId;
			return widget;
		}
	});
	
	ourSpecialWidgets.push(wId);
	return wId;
};

this.destroyOurSpecialWidget = function(aId) {
	if(aId.startsWith(objName+'-special-')) {
		for(var i=0; i<ourSpecialWidgets.length; i++) {
			if(ourSpecialWidgets[i] == aId) {
				ourSpecialWidgets.splice(i, 1);
				CustomizableUI.destroyWidget(aId);
			}
		}
	}
};

this.trackSpecialWidgets = {
	onWidgetAfterDOMChange: function(aNode, aNextNode, aContainer, aIsRemoval) {
		if(!aIsRemoval && aNode && aNode.id
		&& (CustomizableUI.isSpecialWidget(aNode.id) || aNode.id.startsWith(objName+'-special-'))
		&& aNode.id.contains('separator')) {
			aNode.classList.add(CustomizableUI.WIDE_PANEL_CLASS);
		}
	},
	
	onWidgetRemoved: function(aId) {
		// aSync so this happens only after it's dragged (if sync, dragging to palette would still keep the node even though it's been destroyed)
		// see https://bugzilla.mozilla.org/show_bug.cgi?id=1062014
		aSync(function() { destroyOurSpecialWidget(aId); });
	},
	
	onAreaReset: function(aArea) {
		if(aArea == CustomizableUI.AREA_PANEL) {
			while(ourSpecialWidgets.length > 0) {
				CustomizableUI.destroyWidget(ourSpecialWidgets.pop());
			}
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
	// Special widgets aren't allowed in the menu panel by default, so we need to override this behavior (and hope we don't clash with other add-ons doing the same).
	// I hope I can remove this soon. See:
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1058990
	// https://bugzilla.mozilla.org/show_bug.cgi?id=1003588
	
	CUIBackstage = Cu.import("resource:///modules/CustomizableUI.jsm", self);
	CUIInternalOriginal = CUIBackstage.CustomizableUIInternal;
	
	var CUIInternalNew = {};
	for(var p in CUIBackstage.CustomizableUIInternal) {
		if(CUIBackstage.CustomizableUIInternal.hasOwnProperty(p)) {
			var propGetter = CUIBackstage.CustomizableUIInternal.__lookupGetter__(p);
			if(propGetter) {
				CUIInternalNew.__defineGetter__(p, propGetter);
			} else {
				CUIInternalNew[p] = CUIBackstage.CustomizableUIInternal[p];
			}
		}
	}
	
	CUIInternalNew._addWidgetToArea = CUIInternalNew.addWidgetToArea;
	CUIInternalNew._canWidgetMoveToArea = CUIInternalNew.canWidgetMoveToArea;
	CUIInternalNew._buildArea = CUIInternalNew.buildArea;
	CUIInternalNew.addWidgetToArea = addWidgetToArea;
	CUIInternalNew.canWidgetMoveToArea = canWidgetMoveToArea;
	CUIInternalNew.buildArea = buildArea;
	
	CUIBackstage.CustomizableUIInternal = CUIInternalNew;
	
	var panelIds = CustomizableUI.getWidgetIdsInArea(CustomizableUI.AREA_PANEL);
	for(var wId of panelIds) {
		if(wId.startsWith(objName+'-special-')) {
			createOurSpecialWidget(wId);
		}
	}
	
	CustomizableUI.addListener(trackSpecialWidgets);
	
	for(var i of specialWidgets) {
		CustomizableUI.removeWidgetFromArea(objName+'-placeholder-'+i);
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
	
	for(var wId of ourSpecialWidgets) {
		CustomizableUI.destroyWidget(wId);
	}
	
	CUIBackstage.CustomizableUIInternal = CUIInternalOriginal;
};
