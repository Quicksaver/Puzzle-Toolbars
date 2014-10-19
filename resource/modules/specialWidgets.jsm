Modules.VERSION = '1.0.7';

// Special widgets aren't allowed in the menu panel by default, so we need to override this behavior (and hope we don't clash with other add-ons doing the same).
// I hope I can remove this soon. See:
// https://bugzilla.mozilla.org/show_bug.cgi?id=1058990
// https://bugzilla.mozilla.org/show_bug.cgi?id=1003588

this.specialWidgets = ['separator', 'spring', 'spacer'];
this.forbiddenSprings = ['nav-bar', 'PanelUI-contents', objName+'-urlbar-bar'];
this.ourSpecialWidgets = [];

this.addWidgetToArea = function(aWidgetId, aArea, aPosition, aInitialAdd) {
	if(aWidgetId.startsWith(objName+'-placeholder-')) {
		aWidgetId = aWidgetId.match(/spring|spacer|separator/)[0];
		
		if(aWidgetId == 'spring' && forbiddenSprings.indexOf(aArea) > -1) {
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
		if(aWidgetId.contains('spring') && forbiddenSprings.indexOf(aArea) > -1) {
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
		
		if(aWidgetId.contains('spring') && forbiddenSprings.indexOf(aArea) > -1) {
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
		if(!UNLOADED) {
			aSync(function() { destroyOurSpecialWidget(aId); });
		}
	},
	
	onAreaReset: function(aArea) {
		if(aArea == CustomizableUI.AREA_PANEL) {
			while(ourSpecialWidgets.length > 0) {
				CustomizableUI.destroyWidget(ourSpecialWidgets.pop());
			}
		}
	}
};

Modules.LOADMODULE = function() {
	Piggyback.add('specialWidgets', CUIBackstage.CustomizableUIInternal, 'addWidgetToArea', addWidgetToArea);
	Piggyback.add('specialWidgets', CUIBackstage.CustomizableUIInternal, 'canWidgetMoveToArea', canWidgetMoveToArea);
	Piggyback.add('specialWidgets', CUIBackstage.CustomizableUIInternal, 'buildArea', buildArea);
	
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
	
	Overlays.overlayURI('chrome://browser/content/browser.xul', 'specialWidgets');
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayURI('chrome://browser/content/browser.xul', 'specialWidgets');
	
	CustomizableUI.removeListener(trackSpecialWidgets);
	
	for(var wId of ourSpecialWidgets) {
		CustomizableUI.destroyWidget(wId);
	}
	
	Piggyback.remove('specialWidgets', CUIBackstage.CustomizableUIInternal, 'addWidgetToArea');
	Piggyback.remove('specialWidgets', CUIBackstage.CustomizableUIInternal, 'canWidgetMoveToArea');
	Piggyback.remove('specialWidgets', CUIBackstage.CustomizableUIInternal, 'buildArea');
};
