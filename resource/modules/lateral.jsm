/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.6

this.__defineGetter__('gCustomizeMode', function() { return window.gCustomizeMode; });

// need this for our custom handlers in CustomizeMode
this.CMBackstage = null;
this.__defineGetter__('gDraggingInToolbars', function() {
	if(!CMBackstage) {
		let scope = {};
		CMBackstage = Cu.import("resource:///modules/CustomizeMode.jsm", scope);
	}
	return CMBackstage.gDraggingInToolbars;
});

this.lateral = {
	// ammount of pixels to clip the bar to when it is closed or hidden
	CLIP: 4,

	get container () { return $(objName+'-lateral-container'); },
	get bar () { return $(objName+'-lateral-bar'); },
	get PP () { return $(objName+'-lateral-PP'); },

	get isSidebarOpen () {
		var open = dispatch(window, { type: 'IsSidebarOpen', asking: true });
		if(open !== undefined) {
			return open;
		}

		var box = $('sidebar-box');
		return box && !box.hidden && LTR == (Prefs.lateral_placement == 'left');
	},

	key: {
		id: objName+'-lateral-key',
		command: objName+':ToggleLateralBar',
		get keycode () { return Prefs.lateral_keycode; },
		get accel () { return Prefs.lateral_accel; },
		get shift () { return Prefs.lateral_shift; },
		get alt () { return Prefs.lateral_alt; },
		get ctrl () { return Prefs.lateral_ctrl; }
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'lateral_pp':
				this.togglePP();
				break;

			case 'lateral_placement':
				this.placement();
				this.sidebarOpen();
				break;

			case 'lateral_bottom':
				this.toggleBottom();
				break;

			case 'lateral_keycode':
			case 'lateral_accel':
			case 'lateral_shift':
			case 'lateral_alt':
			case 'lateral_ctrl':
				this.setKey();
				break;

			case 'lateral_autohide':
			case 'fullscreen.autohide':
				this.autoHide();
				break;
		}
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'PuzzleBarsMoved':
				this.move();
				break;

			case 'beforecustomization':
			case 'aftercustomization':
				this.customize(e);
				break;

			case 'fullscreen':
				this.autoHide();
				break;
		}
	},

	attrWatcher: function() {
		this.sidebarOpen();
	},

	setKey: function() {
		if(this.key.keycode != 'none') { Keysets.register(this.key); }
		else { Keysets.unregister(this.key); }
	},
	// lateralSidebarOpen
	sidebarOpen: function() {
		toggleAttribute(this.bar, 'sidebarOpen', this.isSidebarOpen);
	},

	style: {},
	move: function() {
		this.style = {
			top: 1,
			bottom: 2,
			left: 0,
			right: 0,
			height: 0
		};

		var browserPos = $('browser').getBoundingClientRect();
		this.style.top += browserPos.top;
		this.style.bottom += document.documentElement.clientHeight -browserPos.bottom;
		this.style.left += browserPos.left;
		this.style.right += document.documentElement.clientWidth -browserPos.right;
		this.style.height += browserPos.height;

		this.style.left += (LTR) ? $('browser-border-start').clientWidth : $('browser-border-end').clientWidth;
		this.style.right += (LTR) ? $('browser-border-end').clientWidth : $('browser-border-start').clientWidth;

		var OSoffset = (WINNT) ? -2 : 0;
		var ppOffsetX = this.PP.lastChild.clientWidth -this.PP.clientWidth;
		var ppOffsetY = this.PP.lastChild.clientHeight -this.PP.clientHeight;

		// needs some correction
		this.style.bottom += ppOffsetY;

		var clipOffWidth = this.container.clientWidth +this.container.clientLeft;
		var barOffset = clipOffWidth -this.CLIP;

		var shrunkOffset = 0;
		var shrunkOffsetHover = 0;
		if(this.bar.clientWidth > 0) {
			var PPsize = (!DARWIN) ? 22 : 24; // when shrunk
			shrunkOffset -= Math.floor((PPsize -this.bar.clientWidth) /2);
			shrunkOffsetHover -= Math.min(Math.floor((PPsize +((32-PPsize) /2) -this.bar.clientWidth) /2), 0);
		}

		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[autohide] {\n\
					top: '+(this.style.top -1)+'px;\n\
					height: '+Math.max(this.style.height, 5)+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[autohide]:-moz-any([hover],:hover) {\n\
					clip: rect(0px, '+clipOffWidth+'px, '+this.style.height+'px, 0px);\n\
				}\n\
				\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container:not([movetoright])[autohide] {\n\
					left: '+this.style.left+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container:not([movetoright])[collapsed="true"],\n\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container:not([movetoright])[autohide]:not([hover]):not(:hover) {\n\
					left: '+(this.style.left -barOffset)+'px;\n\
					clip: rect(0px, '+clipOffWidth+'px, '+this.style.height+'px, '+(clipOffWidth -this.CLIP)+'px);\n\
				}\n\
				\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[movetoright][autohide] {\n\
					right: '+this.style.right+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[movetoright][collapsed="true"],\n\
				window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-lateral-container[movetoright][autohide]:not([hover]):not(:hover) {\n\
					right: '+(this.style.right -barOffset)+'px;\n\
					clip: rect(0px, '+this.CLIP+'px, '+this.style.height+'px, 0px);\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetobottom]):-moz-any(:not([active]),:not([inSidebar])) {\n\
					top: '+this.style.top+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetobottom]:-moz-any(:not([active]),:not([inSidebar])) {\n\
					bottom: '+this.style.bottom+'px;\n\
				}\n\
				\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright]):not([active]) {\n\
					left: '+(this.style.left +ppOffsetX +OSoffset)+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright])[active]:not([inSidebar]) {\n\
					left: '+(this.style.left +ppOffsetX +OSoffset +shrunkOffsetHover)+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright])[active]:not([inSidebar]):not(:hover) {\n\
					left: '+(this.style.left +ppOffsetX +OSoffset +shrunkOffset)+'px;\n\
				}\n\
				@media not all and (-moz-windows-classic) {\n\
					@media (-moz-windows-default-theme) {\n\
						window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-lateral-PP:not([movetoright])[active]:not([inSidebar]):not(:hover) {\n\
							left: '+(this.style.left +ppOffsetX +OSoffset +shrunkOffset +1)+'px;\n\
						}\n\
					}\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright]):not([active]):not(:hover):not([hover]),\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP:not([movetoright])[autohide][active]:not([inSidebar]):not(:hover):not([hover]) {\n\
					left: '+(this.style.left +ppOffsetX +OSoffset -21)+'px;\n\
				}\n\
				\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright]:not([active]) {\n\
					right: '+(this.style.right +ppOffsetX +OSoffset)+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright][active]:not([inSidebar]) {\n\
					right: '+(this.style.right +ppOffsetX +OSoffset +shrunkOffsetHover)+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright][active]:not([inSidebar]):not(:hover) {\n\
					right: '+(this.style.right +ppOffsetX +OSoffset +shrunkOffset)+'px;\n\
				}\n\
				@media not all and (-moz-windows-classic) {\n\
					@media (-moz-windows-default-theme) {\n\
						window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-lateral-PP[movetoright][active]:not([inSidebar]):not(:hover) {\n\
							right: '+(this.style.right +ppOffsetX +OSoffset +shrunkOffset +1)+'px;\n\
						}\n\
					}\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright]:not([active]):not(:hover):not([hover]),\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-lateral-PP[movetoright][autohide][active]:not([inSidebar]):not(:hover):not([hover]) {\n\
					right: '+(this.style.right +ppOffsetX +OSoffset -21)+'px;\n\
				}\n\
			}';

		Styles.load('lateralMove_'+_UUID, sscode, true);
	},

	initOverflow: function(bar) {
		// we need to reset the overflow status in case it has already been initialized, because it deals with horizontal overflow
		if(bar.overflowable.initialized) {
			bar.overflowable.uninit();
			bar.overflowable._lazyResizeHandler = null;
			bar.addEventListener("overflow", bar);
			bar.addEventListener("underflow", bar);
			setAttribute(bar, 'overflowable', 'true');
		}

		// need to keep backups and restore them afterwards, to prevent a ZC
		Piggyback.add('lateral', bar.overflowable, 'onOverflow', function(e) {
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
		});

		Piggyback.add('lateral', bar.overflowable, '_onLazyResize', function() {
			if(!this._enabled) { return; }

			if(this._target.scrollTopMax > 0) {
				this.onOverflow();
			} else {
				this._moveItemsBackToTheirOrigin();
			}
		});

		Piggyback.add('lateral', bar.overflowable, '_moveItemsBackToTheirOrigin', function(shouldMoveAllItems) {
			// means we've disabled the add-on, this is unnecessary
			if(typeof(CUIBackstage) == 'undefined') { return; }

			let placements = CUIBackstage.gPlacements.get(this._toolbar.id);
			while(this._list.firstChild) {
				let child = this._list.firstChild;
				let minSize = this._collapsed.get(child.id);

				if(!shouldMoveAllItems && minSize && this._target.clientHeight <= minSize) { return; }

				this._collapsed.delete(child.id);
				let beforeNodeIndex = placements.indexOf(child.id) + 1;

				// If this is a skipintoolbarset item, meaning it doesn't occur in the placements list, we're inserting it at the end.
				// This will mean first-in, first-out (more or less) leading to as little change in order as possible.
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
		});

		bar.overflowable.init();
		bar.overflowable._enabled = true;
		if(bar.customizationTarget.scrollTopMax > 0) {
			bar.overflowable.onOverflow();
		}
	},

	deinitOverflow: function(bar) {
		// can happen when closing a window
		if(!bar.overflowable) { return; }

		if(bar.overflowable.initialized) {
			bar.overflowable.uninit();
			bar.overflowable._lazyResizeHandler = null;
		}

		Piggyback.revert('lateral', bar.overflowable, 'onOverflow');
		Piggyback.revert('lateral', bar.overflowable, '_onLazyResize');
		Piggyback.revert('lateral', bar.overflowable, '_moveItemsBackToTheirOrigin');
	},

	togglePP: function() {
		this.PP.hidden = !Prefs.lateral_pp;
		toggleAttribute(this.bar, 'hidePP', !Prefs.lateral_pp);

		// this is done here because if the PP is hidden, its clientWidth is 0, so it needs to update its position when it's shown
		this.move();
	},

	toggleBottom: function() {
		toggleAttribute(this.bar, 'movetobottom', Prefs.lateral_bottom);
	},

	autoHide: function() {
		if(!customizing && (Prefs.lateral_autohide || onFullScreen.hideBars)) {
			autoHide.init(this.bar, [this.container, this.PP], this.container, 'opacity');
		} else {
			autoHide.deinit(this.bar);
		}
	},

	customize: function(e) {
		if(e && (e === true || e.type == 'beforecustomization')) {
			// I have to disable autohide, or it screws up the layout when leaving customize mode, no idea why though...
			autoHide.deinit(this.bar);
			Overlays.overlayWindow(window, 'lateralCustomize');
		} else {
			Overlays.removeOverlayWindow(window, 'lateralCustomize');
			this.autoHide();
		}
	},

	placement: function() {
		if(LTR == (Prefs.lateral_placement == 'right')) {
			Overlays.overlayURI('chrome://'+objPathString+'/content/lateral.xul', 'lateralRight');
			Overlays.overlayURI('chrome://'+objPathString+'/content/lateralCustomize.xul', 'lateralRightCustomize');
		} else {
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateral.xul', 'lateralRight');
			Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateralCustomize.xul', 'lateralRightCustomize');
		}

		toggleAttribute(this.bar, 'movetoright', Prefs.lateral_placement == 'right');
	},

	onLoad: function() {
		this.bar._puzzleBar = this;

		Listeners.add(window, 'PuzzleBarsMoved', this);
		Watchers.addAttributeWatcher($('sidebar-box'), 'hidden', this);

		this.sidebarOpen();
		this.toggleBottom();
		this.placement();
		this.togglePP(); // implies this.move()
		this.autoHide();

		bars.init(this.bar, this.PP);
		this.initOverflow(this.bar);

		Listeners.add(window, 'beforecustomization', this);
		Listeners.add(window, 'aftercustomization', this);
		this.customize(customizing);
	},

	onUnload: function() {
		Listeners.remove(window, 'beforecustomization', this);
		Listeners.remove(window, 'aftercustomization', this);
		Overlays.removeOverlayWindow(window, 'lateralCustomize');

		Listeners.remove(window, 'PuzzleBarsMoved', this);
		Watchers.removeAttributeWatcher($('sidebar-box'), 'hidden', this);

		// deinitialize bar after we've removed all listeners and handlers, so they don't react to this uselessly
		autoHide.deinit(this.bar);
		this.deinitOverflow(this.bar);
		bars.deinit(this.bar, this.PP);

		delete this.bar._puzzleBar;
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('lateral_pp', lateral);
	Prefs.listen('lateral_bottom', lateral);
	Prefs.listen('lateral_placement', lateral);
	Prefs.listen('lateral_autohide', lateral);
	Prefs.listen('lateral_keycode', lateral);
	Prefs.listen('lateral_accel', lateral);
	Prefs.listen('lateral_shift', lateral);
	Prefs.listen('lateral_alt', lateral);
	Prefs.listen('lateral_ctrl', lateral);
	Prefs.listen('fullscreen.autohide', lateral);
	onFullScreen.add(lateral);

	lateral.setKey();

	// http://mxr.mozilla.org/mozilla-central/source/browser/components/customizableui/CustomizeMode.jsm
	Piggyback.add('lateral', gCustomizeMode, '_onDragOver', function(e) {
		if(this._isUnwantedDragDrop(e)) { return; }

		if(this._initializeDragAfterMove) {
			this._initializeDragAfterMove();
		}

		// we don't have access to this from here, and we shouldn't need to anyway
		//__dumpDragData(aEvent);

		// fallback to original method in case there's nothing to do here
		let targetArea = this._getCustomizableParent(e.currentTarget);
		if(!trueAttribute(targetArea, 'verticalToolbar')) {
			this.__onDragOver(e);
			return;
		}

		let document = e.target.ownerDocument;
		let documentId = document.documentElement.id;
		if(!e.dataTransfer.mozTypesAt(0)) { return; }

		let draggedItemId = e.dataTransfer.mozGetDataAt("text/toolbarwrapper-id/" + documentId, 0);
		let draggedWrapper = document.getElementById("wrapper-" + draggedItemId);
		let originArea = this._getCustomizableParent(draggedWrapper);

		// Do nothing if the target or origin are not customizable.
		if(!originArea) { return; }

		// Do nothing if the widget is not allowed to move to the target area.
		if(!CustomizableUI.canWidgetMoveToArea(draggedItemId, targetArea.id)) { return; }

		let targetNode = this._getDragOverNode(e, targetArea, true, draggedItemId);

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
				let before = e.clientY < dropTargetCenter;
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

		e.preventDefault();
		e.stopPropagation();
	});

	Piggyback.add('lateral', gCustomizeMode, '_setDragActive', function(aItem, aValue, aDraggedItemId, aInToolbar) {
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
			let direction = getComputedStyle(aItem).direction;
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
	});

	Piggyback.add('lateral', gCustomizeMode, '_cancelDragActive', function(aItem, aNextItem, aNoTransition) {
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
	});

	Overlays.overlayWindow(window, 'lateral', lateral);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'lateral');
	Styles.unload('lateralMove_'+_UUID);

	Piggyback.revert('lateral', gCustomizeMode, '_onDragOver');
	Piggyback.revert('lateral', gCustomizeMode, '_setDragActive');
	Piggyback.revert('lateral', gCustomizeMode, '_cancelDragActive');

	onFullScreen.remove(lateral);
	Prefs.unlisten('fullscreen.autohide', lateral);
	Prefs.unlisten('lateral_pp', lateral);
	Prefs.unlisten('lateral_bottom', lateral);
	Prefs.unlisten('lateral_placement', lateral);
	Prefs.unlisten('lateral_autohide', lateral);
	Prefs.unlisten('lateral_keycode', lateral);
	Prefs.unlisten('lateral_accel', lateral);
	Prefs.unlisten('lateral_shift', lateral);
	Prefs.unlisten('lateral_alt', lateral);
	Prefs.unlisten('lateral_ctrl', lateral);

	if(UNLOADED || !Prefs.lateral_bar) {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateral.xul', 'lateralRight');
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/lateralCustomize.xul', 'lateralRightCustomize');
		Keysets.unregister(lateral.key);
	}
};
