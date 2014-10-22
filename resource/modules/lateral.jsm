Modules.VERSION = '1.0.6';

// ammount of pixels to clip the bar to when it is closed or hidden
this.CLIPBAR_LATERAL = 4;

this.__defineGetter__('gCustomizeMode', function() { return window.gCustomizeMode; });
this.__defineGetter__('lateralContainer', function() { return $(objName+'-lateral-container'); });
this.__defineGetter__('lateralBar', function() { return $(objName+'-lateral-bar'); });
this.__defineGetter__('lateralPP', function() { return $(objName+'-lateral-PP'); });
this.__defineGetter__('sidebarOpen', function() { return $('sidebar-box') ? !$('sidebar-box').hidden : false; });

this.lateralKey = {
	id: objName+'-lateral-key',
	command: objName+':ToggleLateralBar',
	get keycode () { return Prefs.lateral_keycode; },
	get accel () { return Prefs.lateral_accel; },
	get shift () { return Prefs.lateral_shift; },
	get alt () { return Prefs.lateral_alt; }
};

this.setLateralKey = function() {
	if(lateralKey.keycode != 'none') { Keysets.register(lateralKey); }
	else { Keysets.unregister(lateralKey); }
};

this.lateralSidebarOpen = function() {
	toggleAttribute(lateralBar, 'sidebarOpen', sidebarOpen && LTR == (Prefs.lateral_placement == 'left'));
};

this.lateralStyle = {};
this.lateralMove = function() {
	lateralStyle = {
		top: 1,
		bottom: 2,
		left: 0,
		right: 0,
		height: 0
	};
	
	var browserPos = $('browser').getBoundingClientRect();
	lateralStyle.top += browserPos.top;
	lateralStyle.bottom += document.documentElement.clientHeight -browserPos.bottom;
	lateralStyle.left += browserPos.left;
	lateralStyle.right += document.documentElement.clientWidth -browserPos.right;
	lateralStyle.height += browserPos.height;
	
	lateralStyle.left += (LTR) ? $('browser-border-start').clientWidth : $('browser-border-end').clientWidth;
	lateralStyle.right += (LTR) ? $('browser-border-end').clientWidth : $('browser-border-start').clientWidth;
	
	var OSoffset = (WINNT) ? -2 : 0;
	var ppOffsetX = lateralPP.lastChild.clientWidth -lateralPP.clientWidth;
	var ppOffsetY = lateralPP.lastChild.clientHeight -lateralPP.clientHeight;
	
	// needs some correction
	lateralStyle.bottom += ppOffsetY;
	
	var clipOffWidth = lateralContainer.clientWidth +lateralContainer.clientLeft;
	var barOffset = clipOffWidth -CLIPBAR_LATERAL;
	
	var shrunkOffset = 0;
	var shrunkOffsetHover = 0;
	if(lateralBar.clientWidth > 0) {
		var PPsize = (!DARWIN) ? 22 : 24; // when shrunk
		shrunkOffset -= Math.floor((PPsize -lateralBar.clientWidth) /2);
		shrunkOffsetHover -= Math.min(Math.floor((PPsize +((32-PPsize) /2) -lateralBar.clientWidth) /2), 0);
	}
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[autohide] {\n';
	sscode += '		top: '+(lateralStyle.top -1)+'px;\n';
	sscode += '		height: '+Math.max(lateralStyle.height, 5)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[autohide]:-moz-any([hover],:hover) {\n';
	sscode += '		clip: rect(0px, '+clipOffWidth+'px, '+lateralStyle.height+'px, 0px);\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container:not([movetoright])[autohide] {\n';
	sscode += '		left: '+lateralStyle.left+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container:not([movetoright])[collapsed="true"],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container:not([movetoright])[autohide]:not([hover]):not(:hover) {\n';
	sscode += '		left: '+(lateralStyle.left -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+clipOffWidth+'px, '+lateralStyle.height+'px, '+(clipOffWidth -CLIPBAR_LATERAL)+'px);\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[movetoright][autohide] {\n';
	sscode += '		right: '+lateralStyle.right+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[movetoright][collapsed="true"],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[movetoright][autohide]:not([hover]):not(:hover) {\n';
	sscode += '		right: '+(lateralStyle.right -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+CLIPBAR_LATERAL+'px, '+lateralStyle.height+'px, 0px);\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetobottom]) { top: '+lateralStyle.top+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetobottom] { bottom: '+lateralStyle.bottom+'px; }\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright]):not([active]) {\n';
	sscode += '		left: '+(lateralStyle.left +ppOffsetX +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright])[active] {\n';
	sscode += '		left: '+(lateralStyle.left +ppOffsetX +OSoffset +shrunkOffsetHover)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright])[active]:not(:hover) {\n';
	sscode += '		left: '+(lateralStyle.left +ppOffsetX +OSoffset +shrunkOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	@media not all and (-moz-windows-classic) {\n';
	sscode += '		@media (-moz-windows-default-theme) {\n';
	sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-lateral-PP:not([movetoright])[active]:not(:hover) {\n';
	sscode += '				left: '+(lateralStyle.left +ppOffsetX +OSoffset +shrunkOffset +1)+'px;\n';
	sscode += '			}\n';
	sscode += '		}\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright]):not([active]):not(:hover):not([hover]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright])[autohide][active]:not(:hover):not([hover]) {\n';
	sscode += '		left: '+(lateralStyle.left +ppOffsetX +OSoffset -21)+'px;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright]:not([active]) {\n';
	sscode += '		right: '+(lateralStyle.right +ppOffsetX +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright][active] {\n';
	sscode += '		right: '+(lateralStyle.right +ppOffsetX +OSoffset +shrunkOffsetHover)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright][active]:not(:hover) {\n';
	sscode += '		right: '+(lateralStyle.right +ppOffsetX +OSoffset +shrunkOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	@media not all and (-moz-windows-classic) {\n';
	sscode += '		@media (-moz-windows-default-theme) {\n';
	sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-lateral-PP[movetoright][active]:not(:hover) {\n';
	sscode += '				right: '+(lateralStyle.right +ppOffsetX +OSoffset +shrunkOffset +1)+'px;\n';
	sscode += '			}\n';
	sscode += '		}\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright]:not([active]):not(:hover):not([hover]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright][autohide][active]:not(:hover):not([hover]) {\n';
	sscode += '		right: '+(lateralStyle.right +ppOffsetX +OSoffset -21)+'px;\n';
	sscode += '	}\n';
	
	sscode += '}';
	
	Styles.load('lateralMove_'+_UUID, sscode, true);
};

// need this for our custom handlers below
this.CMBackstage = null;
this.__defineGetter__('gDraggingInToolbars', function() {
	if(!CMBackstage) {
		let scope = {};
		CMBackstage = Cu.import("resource:///modules/CustomizeMode.jsm", scope);
	}
	return CMBackstage.gDraggingInToolbars;
});

this.CModeOnDragOver = function(aEvent) {
	if(this._isUnwantedDragDrop(aEvent)) { return; }
	
	if(this._initializeDragAfterMove) {
		this._initializeDragAfterMove();
	}
	
	// we don't have access to this from here, and we shouldn't need to anyway
	//__dumpDragData(aEvent);
	
	// fallback to original method in case there's nothing to do here
	let targetArea = this._getCustomizableParent(aEvent.currentTarget);
	if(!trueAttribute(targetArea, 'verticalToolbar')) {
		this.__onDragOver(aEvent);
		return;
	}
	
	let document = aEvent.target.ownerDocument;
	let documentId = document.documentElement.id;
	if(!aEvent.dataTransfer.mozTypesAt(0)) { return; }
	
	let draggedItemId = aEvent.dataTransfer.mozGetDataAt("text/toolbarwrapper-id/" + documentId, 0);
	let draggedWrapper = document.getElementById("wrapper-" + draggedItemId);
	let originArea = this._getCustomizableParent(draggedWrapper);
	
	// Do nothing if the target or origin are not customizable.
	if(!originArea) { return; }
	
	// Do nothing if the widget is not allowed to move to the target area.
	if(!CustomizableUI.canWidgetMoveToArea(draggedItemId, targetArea.id)) { return; }
	
	let targetNode = this._getDragOverNode(aEvent, targetArea, true, draggedItemId);
	
	// We need to determine the place that the widget is being dropped in the target.
	let dragOverItem, dragValue;
	if(targetNode == targetArea.customizationTarget) {
		// We'll assume if the user is dragging directly over the target, that they're attempting to append a child to that target.
		dragOverItem = this._findVisiblePreviousSiblingNode(targetNode.lastChild) || targetNode;
		dragValue = "after";
	} else {
		let targetParent = targetNode.parentNode;
		let position = Array.indexOf(targetParent.children, targetNode);
		if(position == -1) {
			dragOverItem = this._findVisiblePreviousSiblingNode(targetNode.lastChild);
			dragValue = "after";
		} else {
			dragOverItem = targetParent.children[position];
			dragOverItem = this._findVisiblePreviousSiblingNode(targetParent.children[position]);
			
			// Check if the aDraggedItem is hovered past the first half of dragOverItem
			let window = dragOverItem.ownerDocument.defaultView;
			let itemRect = dragOverItem.getBoundingClientRect();
			let dropTargetCenter = itemRect.top + (itemRect.height / 2);
			let existingDir = dragOverItem.getAttribute("dragover");
			if(existingDir) {
				if(existingDir == "before") {
					dropTargetCenter += (parseInt(dragOverItem.style.borderTopWidth) || 0) / 2;
				} else {
					dropTargetCenter -= (parseInt(dragOverItem.style.borderBottomWidth) || 0) / 2;
				}
			}
			let before = aEvent.clientY < dropTargetCenter;
			dragValue = before ? "before" : "after";
		}
	}
	
	if(this._dragOverItem && dragOverItem != this._dragOverItem) {
		this._cancelDragActive(this._dragOverItem, dragOverItem);
	}
	
	if(dragOverItem != this._dragOverItem || dragValue != dragOverItem.getAttribute("dragover")) {
		if(dragOverItem != targetArea.customizationTarget) {
			this._setDragActive(dragOverItem, dragValue, draggedItemId, true);
		} else {
			this._updateToolbarCustomizationOutline(this.window, targetArea);
		}
		this._dragOverItem = dragOverItem;
	}
	
	aEvent.preventDefault();
	aEvent.stopPropagation();
};

this.CModeSetDragActive = function(aItem, aValue, aDraggedItemId, aInToolbar) {
	if(!aItem) { return; }
	
	// fallback to original method in case there's nothing to do here
	if(!aInToolbar) {
		this.__setDragActive(aItem, aValue, aDraggedItemId, aInToolbar);
		return;
	}
	
	let targetArea = this._getCustomizableParent(aItem);
	// fallback to original method in case there's nothing to do here
	if(!trueAttribute(targetArea, 'verticalToolbar')) {
		this.__setDragActive(aItem, aValue, aDraggedItemId, aInToolbar);
		return;
	}
	
	if(aItem.getAttribute("dragover") != aValue) {
		setAttribute(aItem, "dragover", aValue);
		
		let window = aItem.ownerDocument.defaultView;
		let draggedItem = window.document.getElementById(aDraggedItemId);
		
		this._updateToolbarCustomizationOutline(window, targetArea);
		let makeSpaceImmediately = false;
		if(!gDraggingInToolbars.has(targetArea.id)) {
			gDraggingInToolbars.add(targetArea.id);
			let draggedWrapper = this.document.getElementById("wrapper-" + aDraggedItemId);
			let originArea = this._getCustomizableParent(draggedWrapper);
			makeSpaceImmediately = originArea == targetArea;
		}
		
		// Calculate width of the item when it'd be dropped in this position
		let height = this._getDragItemSize(aItem, draggedItem).height;
		let direction = window.getComputedStyle(aItem).direction;
		let prop, otherProp;
		
		// If we're inserting before:
		if(aValue == "before") {
			prop = "borderTopWidth";
			otherProp = "border-bottom-width";
		} else {
			// otherwise:
			prop = "borderBottomWidth";
			otherProp = "border-top-width";
		}
		
		if(makeSpaceImmediately) {
			aItem.setAttribute("notransition", "true");
		}
		
		aItem.style[prop] = height + 'px';
		aItem.style.removeProperty(otherProp);
		
		if(makeSpaceImmediately) {
			// Force a layout flush:
			aItem.getBoundingClientRect();
			aItem.removeAttribute("notransition");
		}
	}
};

this.CModeCancelDragActive = function(aItem, aNextItem, aNoTransition) {
	this.__cancelDragActive(aItem, aNextItem, aNoTransition);
	
	let currentArea = this._getCustomizableParent(aItem);
	if (!currentArea) { return; }
	
	let isToolbar = CustomizableUI.getAreaType(currentArea.id) == "toolbar";
	if(isToolbar && trueAttribute(currentArea, 'verticalToolbar')) {
		if(aNoTransition) {
			setAttribute(aItem, "notransition", "true");
		}
		removeAttribute(aItem, "dragover");
		
		// Remove both property values in the case that the end padding had been set.
		aItem.style.removeProperty("border-top-width");
		aItem.style.removeProperty("border-bottom-width");
		
		if(aNoTransition) {
			// Force a layout flush:
			aItem.getBoundingClientRect();
			removeAttribute(aItem, "notransition");
		}
	}
};

this.OTonOverflow = function(e) {
	if(!this._enabled || (e && e.target != this._toolbar.customizationTarget)) { return; }
	
	let child = this._target.lastChild;
	
	while(child && this._target.scrollTopMax > 0) {
		let prevChild = child.previousSibling;
		
		if(child.getAttribute("overflows") != "false") {
			this._collapsed.set(child.id, this._target.clientHeight);
			setAttribute(child, "overflowedItem", true);
			setAttribute(child, "cui-anchorid", this._chevron.id);
			CUIBackstage.CustomizableUIInternal.notifyListeners("onWidgetOverflow", child, this._target);
			
			this._list.insertBefore(child, this._list.firstChild);
			if(!trueAttribute(this._toolbar, "overflowing")) {
				CustomizableUI.addListener(this);
			}
			setAttribute(this._toolbar, "overflowing", "true");
		}
		child = prevChild;
	};
};

this.OTonLazyResize = function() {
	if(!this._enabled) { return; }
	
	if(this._target.scrollTopMax > 0) {
		this.onOverflow();
	} else {
		this._moveItemsBackToTheirOrigin();
	}
};

this.OTmoveItemsBackToTheirOrigin = function(shouldMoveAllItems) {
	// means we've disabled the add-on, this is unnecessary
	if(typeof(CUIBackstage) == 'undefined') { return; }
	
	let placements = CUIBackstage.gPlacements.get(this._toolbar.id);
	while(this._list.firstChild) {
		let child = this._list.firstChild;
		let minSize = this._collapsed.get(child.id);
		
		if(!shouldMoveAllItems && minSize && this._target.clientHeight <= minSize) { return; }
		
		this._collapsed.delete(child.id);
		let beforeNodeIndex = placements.indexOf(child.id) + 1;
		
		// If this is a skipintoolbarset item, meaning it doesn't occur in the placements list, we're inserting it at the end. This will mean first-in, first-out (more or less)
		// leading to as little change in order as possible.
		if(beforeNodeIndex == 0) {
			beforeNodeIndex = placements.length;
		}
		
		let inserted = false;
		for(; beforeNodeIndex < placements.length; beforeNodeIndex++) {
			let beforeNode = this._target.getElementsByAttribute("id", placements[beforeNodeIndex])[0];
			if(beforeNode) {
				this._target.insertBefore(child, beforeNode);
				inserted = true;
				break;
			}
		}
		if(!inserted) {
			this._target.appendChild(child);
		}
		
		child.removeAttribute("cui-anchorid");
		child.removeAttribute("overflowedItem");
		CUIBackstage.CustomizableUIInternal.notifyListeners("onWidgetUnderflow", child, this._target);
	}
	
	if(!this._collapsed.size) {
		this._toolbar.removeAttribute("overflowing");
		CustomizableUI.removeListener(this);
	}
};

this.lateralInitOverflow = function(bar) {
	// we need to reset the overflow status in case it has already been initialized, because it deals with horizontal overflow
	if(bar.overflowable.initialized) {
		bar.overflowable.uninit();
		bar.overflowable._lazyResizeHandler = null;
		bar.addEventListener("overflow", bar);
		bar.addEventListener("underflow", bar);
		setAttribute(bar, 'overflowable', 'true');
	}
	
	// need to keep backups and restore them afterwards, to prevent a ZC
	Piggyback.add('lateral', bar.overflowable, 'onOverflow', OTonOverflow);
	Piggyback.add('lateral', bar.overflowable, '_onLazyResize', OTonLazyResize);
	Piggyback.add('lateral', bar.overflowable, '_moveItemsBackToTheirOrigin', OTmoveItemsBackToTheirOrigin);
	
	bar.overflowable.init();
	bar.overflowable._enabled = true;
	if(bar.customizationTarget.scrollTopMax > 0) {
		bar.overflowable.onOverflow();
	}
};

this.lateralDeinitOverflow = function(bar) {
	// can happen when closing a window
	if(!bar.overflowable) { return; }
	
	if(bar.overflowable.initialized) {
		bar.overflowable.uninit();
		bar.overflowable._lazyResizeHandler = null;
	}
	
	Piggyback.revert('lateral', bar.overflowable, 'onOverflow');
	Piggyback.revert('lateral', bar.overflowable, '_onLazyResize');
	Piggyback.revert('lateral', bar.overflowable, '_moveItemsBackToTheirOrigin');
};

this.lateralTogglePP = function() {
	lateralPP.hidden = !Prefs.lateral_pp;
	toggleAttribute(lateralBar, 'hidePP', !Prefs.lateral_pp);
	
	// this is done here because if the PP is hidden, its clientWidth is 0, so it needs to update its position when it's shown
	lateralMove();
};

this.lateralToggleBottom = function() {
	toggleAttribute(lateralBar, 'movetobottom', Prefs.lateral_bottom);
};

this.lateralAutoHide = function() {
	if(!customizing && (Prefs.lateral_autohide || (!onFullScreen.useLion && onFullScreen.entered && onFullScreen.autohide))) {
		initAutoHide(lateralBar, [lateralContainer, lateralPP], lateralContainer, 'opacity');
	} else {
		deinitAutoHide(lateralBar);
	}
};

this.lateralOnLoad = function() {
	Listeners.add(window, 'PuzzleBarsMoved', lateralMove);
	Watchers.addAttributeWatcher($('sidebar-box'), 'hidden', lateralSidebarOpen);
	
	lateralSidebarOpen();
	lateralToggleBottom();
	lateralPlacement();
	lateralTogglePP(); // implies lateralMove()
	lateralAutoHide();
	
	initBar(lateralBar, lateralPP);
	lateralInitOverflow(lateralBar);
	
	Listeners.add(window, 'beforecustomization', lateralCustomize);
	Listeners.add(window, 'aftercustomization', lateralCustomize);
	lateralCustomize(customizing);
};

this.lateralOnUnload = function() {
	Listeners.remove(window, 'beforecustomization', lateralCustomize);
	Listeners.remove(window, 'aftercustomization', lateralCustomize);
	Overlays.removeOverlayWindow(window, 'lateralCustomize');
	
	deinitAutoHide(lateralBar);
	lateralDeinitOverflow(lateralBar);
	deinitBar(lateralBar, lateralPP);
	
	Listeners.remove(window, 'PuzzleBarsMoved', lateralMove);
	Watchers.removeAttributeWatcher($('sidebar-box'), 'hidden', lateralSidebarOpen);
};

this.lateralCustomize = function(e, force) {
	if(e === true || e.type == 'beforecustomization') {
		// I have to disable autohide, or it screws up the layout when leaving customize mode, no idea why though...
		deinitAutoHide(lateralBar);
		Overlays.overlayWindow(window, 'lateralCustomize');
	} else {
		Overlays.removeOverlayWindow(window, 'lateralCustomize');
		lateralAutoHide();
	}
};

this.lateralPlacement = function() {
	if(LTR == (Prefs.lateral_placement == 'right')) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/lateral.xul', 'lateralRight');
		Overlays.overlayURI('chrome://'+objPathString+'/content/lateralCustomize.xul', 'lateralRightCustomize');
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateral.xul', 'lateralRight');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateralCustomize.xul', 'lateralRightCustomize');
	}
	
	toggleAttribute(lateralBar, 'movetoright', Prefs.lateral_placement == 'right');
};

Modules.LOADMODULE = function() {
	Prefs.listen('lateral_pp', lateralTogglePP);
	Prefs.listen('lateral_bottom', lateralToggleBottom);
	Prefs.listen('lateral_placement', lateralPlacement);
	Prefs.listen('lateral_placement', lateralSidebarOpen);
	Prefs.listen('lateral_autohide', lateralAutoHide);
	Prefs.listen('lateral_keycode', setLateralKey);
	Prefs.listen('lateral_accel', setLateralKey);
	Prefs.listen('lateral_shift', setLateralKey);
	Prefs.listen('lateral_alt', setLateralKey);
	Prefs.listen('fullscreen.autohide', lateralAutoHide);
	onFullScreen.add(lateralAutoHide);
	
	setLateralKey();
	
	// http://mxr.mozilla.org/mozilla-central/source/browser/components/customizableui/CustomizeMode.jsm
	Piggyback.add('lateral', gCustomizeMode, '_onDragOver', CModeOnDragOver);
	Piggyback.add('lateral', gCustomizeMode, '_setDragActive', CModeSetDragActive);
	Piggyback.add('lateral', gCustomizeMode, '_cancelDragActive', CModeCancelDragActive);
	
	Overlays.overlayWindow(window, 'lateral', null, lateralOnLoad, lateralOnUnload);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'lateral');
	Styles.unload('lateralMove_'+_UUID);
	
	Piggyback.revert('lateral', gCustomizeMode, '_onDragOver');
	Piggyback.revert('lateral', gCustomizeMode, '_setDragActive');
	Piggyback.revert('lateral', gCustomizeMode, '_cancelDragActive');
	
	onFullScreen.remove(lateralAutoHide);
	Prefs.unlisten('fullscreen.autohide', lateralAutoHide);
	Prefs.unlisten('lateral_pp', lateralTogglePP);
	Prefs.unlisten('lateral_bottom', lateralToggleBottom);
	Prefs.unlisten('lateral_placement', lateralPlacement);
	Prefs.unlisten('lateral_placement', lateralSidebarOpen);
	Prefs.unlisten('lateral_autohide', lateralAutoHide);
	Prefs.unlisten('lateral_keycode', setLateralKey);
	Prefs.unlisten('lateral_accel', setLateralKey);
	Prefs.unlisten('lateral_shift', setLateralKey);
	Prefs.unlisten('lateral_alt', setLateralKey);
	
	if(UNLOADED || !Prefs.lateral_bar) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateral.xul', 'lateralRight');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateralCustomize.xul', 'lateralRightCustomize');
		Keysets.unregister(lateralKey);
	}
};
