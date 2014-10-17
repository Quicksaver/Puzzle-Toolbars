moduleAid.VERSION = '2.0.5';

this.__defineGetter__('PrintPreviewListener', function() { return window.PrintPreviewListener; });
this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('statusBar', function() { return _statusBar.node || $('status-bar'); });
this.__defineGetter__('customizeMenu', function() { return $('customization-toolbar-menu'); });
this.__defineGetter__('viewMenu', function() { return $('viewToolbarsMenu').firstChild; });
this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

this.bars = {};

// trick to find out the acurate width of the vertical scrollbar
this._scrollBarWidth = null;
this.__defineGetter__('scrollBarWidth', function() {
	if(_scrollBarWidth === null) {
		var scrollDiv = document.createElement("div");
		scrollDiv.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position: fixed; top: -9999px;');
		scrollDiv = browserPanel.appendChild(scrollDiv);
		_scrollBarWidth = 100 -scrollDiv.clientWidth;
		scrollDiv.remove();
	}
	return _scrollBarWidth;
});

this.barCustomized = {
	onWidgetAdded: function(aWidget, aArea) { this.handler(aWidget, aArea); },
	onWidgetRemoved: function(aWidget, aArea) { this.handler(aWidget, aArea); },
	handler: function(aWidget, aArea) {
		if(bars[aArea] && !trueAttribute(bars[aArea], 'customizing')) {
			dispatch(bars[aArea], { type: 'PuzzleBarCustomized', cancelable: false });
		}
	}
};

this.toggleBar = function(id) {
	if(bars[id]) {
		CustomizableUI.setToolbarVisibility(id, bars[id].collapsed);
		toggleAttribute(bars[id], 'customizing', !bars[id].collapsed && customizing);
		
		dispatch(bars[id], { type: 'ToggledPuzzleBar', cancelable: false });
		return;
	}
};

// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
this.setContextMenu = function(e) {
	var notHidden = false;
	for(var b in bars) {
		if(isAncestor(e.originalTarget.triggerNode, bars[b]) || isAncestor(e.originalTarget.triggerNode, bars[b]._pp)) {
			notHidden = true;
			break;
		}
	}
	toggleAttribute(contextOptions, 'hidden', !notHidden);
	toggleAttribute(contextSeparator, 'hidden', !notHidden);
	setMenuEntries(contextMenu);
};

this.setViewMenu = function(e) {
	setMenuEntries(viewMenu);
};

this.setCustomizeMenu = function(e) {
	setMenuEntries(customizeMenu);
};

this.setMenuEntries = function(menu) {
	for(var b in bars) {
		setAttribute(menu.getElementsByAttribute('toolbarId', bars[b].id)[0], 'command', bars[b].getAttribute('menucommand'));
	}
};

this.delayMoveBars = function() {
	timerAid.init('delayMoveAddonBar', moveBars, 0);
};

this.moveBars = function() {
	// there's no point in doing all this in customize mode
	if(customizing) { return; }
	
	dispatch(window, { type: "PuzzleBarsMoved", cancelable: false });
	
	reMoveBars();
};

this.reMoveBars = function() {
	for(var b in bars) {
		reMoveBar(bars[b]);
	}
};

this.reMoveBar = function(bar) {
	var lastSize = {
		height: bar.clientHeight +(bar.clientTop *2),
		width: bar.clientWidth +(bar.clientLeft *2)
	};
	timerAid.init('reMoveBar-'+bar.id, function() {
		if(typeof(moveBars) != 'undefined' && !UNLOADED) {
			var nowSize = {
				height: bar.clientHeight +(bar.clientTop *2),
				width: bar.clientWidth +(bar.clientLeft *2)
			};
			if(lastSize.width != nowSize.width || lastSize.height != nowSize.height) {
				moveBars();
			}
		}
	}, 500);
};

this.initBar = function(bar, pp) {
	bars[bar.id] = bar;
	bar._pp = pp;
	pp._bar = bar;
	
	if(trueAttribute(bar, 'overflowable') && bar.getAttribute('overflowtarget')) {
		bar._overflowTarget = $(bar.getAttribute('overflowtarget'));
	}
	
	listenerAid.add(bar, 'resize', delayMoveBars);
	listenerAid.add(bar, 'drop', delayMoveBars);
	listenerAid.add(bar, 'load', delayMoveBars);
	
	// moveBars won't fire when setting hidden/collapsed in the buttons, unless we make it follow these changes
	bar._moveOnHidingAttr = new window.MutationObserver(function(mutations) {
		// we don't need to schedule for every difference, we only need to schedule if there is any
		for(var m of mutations) {
			if(m.oldValue != m.target.getAttribute(m.attributeName)) {
				// the mutation observer already fires on a "delay" after the attr changes take place,
				// so there's no need to further delay on our side
				moveBars();
				return;
			}
		}
	});
	bar._moveOnHidingAttr.observe(bar, {
		attributes: true,
		subtree: true,
		attributeFilter: ['hidden', 'collapsed'],
		attributeOldValue: true
	});
	
	aSync(function() { bar.hidden = false; }); // aSync works best
	dispatch(bar, { type: "LoadedPuzzleBar", cancelable: false });
};

this.deinitBar = function(bar, pp) {
	// Prevent things from jumping around on startup
	bar.hidden = true;
	dispatch(bar, { type: "UnloadedPuzzleBar", cancelable: false });
	
	bar._moveOnHidingAttr.disconnect();
	
	listenerAid.remove(bar, 'resize', delayMoveBars);
	listenerAid.remove(bar, 'drop', delayMoveBars);
	listenerAid.remove(bar, 'load', delayMoveBars);
	
	delete bar._overflowTarget;
	delete pp._bar;
	delete bar._moveOnHidingAttr;
	delete bar._pp;
	delete bars[bars.id];
};

moduleAid.LOADMODULE = function() {
	// The add-on bar needs to be hidden when entering print preview mode
	piggyback.add('initAddonbar', PrintPreviewListener, '_hideChrome', function() {
		setAttribute(document.documentElement, 'PrintPreview', 'true');
		return true;
	}, piggyback.MODE_BEFORE);
	piggyback.add('initAddonbar', PrintPreviewListener, '_showChrome', function() {
		removeAttribute(document.documentElement, 'PrintPreview');
		return true;
	}, piggyback.MODE_BEFORE);
	
	CustomizableUI.addListener(barCustomized);
	
	listenerAid.add(contextMenu, 'popupshowing', setContextMenu);
	listenerAid.add(viewMenu, 'popupshown', setViewMenu);
	listenerAid.add(customizeMenu, 'popupshown', setCustomizeMenu);
	listenerAid.add(browserPanel, 'resize', delayMoveBars);
	listenerAid.add(window, 'aftercustomization', delayMoveBars);
	listenerAid.add(window, 'ToggledPuzzleBar', moveBars);
	listenerAid.add(window, 'PuzzleBarCustomized', moveBars);
	
	// Half fix for when the status-bar is changed
	listenerAid.add(statusBar, 'load', delayMoveBars, true);
	
	moveBars();
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(contextMenu, 'popupshowing', setContextMenu);
	listenerAid.remove(viewMenu, 'popupshown', setViewMenu);
	listenerAid.remove(customizeMenu, 'popupshown', setCustomizeMenu);
	listenerAid.remove(browserPanel, 'resize', delayMoveBars);
	listenerAid.remove(window, 'aftercustomization', delayMoveBars);
	listenerAid.remove(window, 'ToggledPuzzleBar', moveBars);
	listenerAid.remove(window, 'PuzzleBarCustomized', moveBars);
	listenerAid.remove(statusBar, 'load', delayMoveBars, true);
	
	CustomizableUI.removeListener(barCustomized);
	
	piggyback.revert('initAddonbar', PrintPreviewListener, '_hideChrome');
	piggyback.revert('initAddonbar', PrintPreviewListener, '_showChrome');
	removeAttribute(document.documentElement, 'PrintPreview');
};
