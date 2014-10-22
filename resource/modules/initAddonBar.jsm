Modules.VERSION = '2.1.3';

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

// some bars need to properly force autohide on when in full screen, this is just a helper to ease this process
this.onFullScreen = {
	handlers: [],
	
	get useLion () { return window.FullScreen.useLionFullScreen; },
	get autohide () { return Prefs['fullscreen.autohide']; },
	
	// we don't care when entering DOM fullscreen, everything is hidden there, so no use in de/initializing anything
	entered: window.fullScreen && !document.mozFullScreen,
	
	add: function(h) {
		if(this.handlers.indexOf(h) == -1) {
			this.handlers.push(h);
		}
	},
	
	remove: function(h) {
		if(this.handlers.indexOf(h) > -1) {
			this.handlers.splice(this.handlers.indexOf(h), 1);
		}
	},
	
	listener: function(e) {
		var inFullScreen = window.fullScreen;
		// we get the event before the change is made
		if(e && e.type == 'fullscreen') {
			inFullScreen = !inFullScreen;
		}
		inFullScreen = inFullScreen && !document.mozFullScreen;
		
		// only call the handlers if there was a change
		if(inFullScreen == onFullScreen.entered) { return; }
		onFullScreen.entered = inFullScreen;
		
		for(var h of onFullScreen.handlers) {
			h();
		}
	},
	
	listenDOM: function(m) {
		setAttribute(document.documentElement, objName+'-noAnimation', 'true');
		toggleAttribute(document.documentElement, objName+'-fullscreen', m.data);
		aSync(function() {
			removeAttribute(document.documentElement, objName+'-noAnimation');
		});
	}
};

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
	Timers.init('delayMoveAddonBar', moveBars, 0);
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
	Timers.init('reMoveBar-'+bar.id, function() {
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
	
	Listeners.add(bar, 'resize', delayMoveBars);
	Listeners.add(bar, 'drop', delayMoveBars);
	Listeners.add(bar, 'load', delayMoveBars);
	
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
	
	Listeners.remove(bar, 'resize', delayMoveBars);
	Listeners.remove(bar, 'drop', delayMoveBars);
	Listeners.remove(bar, 'load', delayMoveBars);
	
	delete bar._overflowTarget;
	delete pp._bar;
	delete bar._moveOnHidingAttr;
	delete bar._pp;
	delete bars[bars.id];
};

Modules.LOADMODULE = function() {
	// The add-on bar needs to be hidden when entering print preview mode
	Piggyback.add('initAddonbar', PrintPreviewListener, '_hideChrome', function() {
		setAttribute(document.documentElement, 'PrintPreview', 'true');
		return true;
	}, Piggyback.MODE_BEFORE);
	Piggyback.add('initAddonbar', PrintPreviewListener, '_showChrome', function() {
		removeAttribute(document.documentElement, 'PrintPreview');
		return true;
	}, Piggyback.MODE_BEFORE);
	
	CustomizableUI.addListener(barCustomized);
	
	var fullscreenDefaults = {};
	fullscreenDefaults['fullscreen.autohide'] = true;
	Prefs.setDefaults(fullscreenDefaults, 'browser', '');
	
	Messenger.loadInWindow(window, 'initPuzzleBars');
	Messenger.listenWindow(window, 'DOMFullScreen', onFullScreen.listenDOM);
	
	Listeners.add(contextMenu, 'popupshowing', setContextMenu);
	Listeners.add(viewMenu, 'popupshown', setViewMenu);
	Listeners.add(customizeMenu, 'popupshown', setCustomizeMenu);
	Listeners.add(browserPanel, 'resize', delayMoveBars);
	Listeners.add(window, 'aftercustomization', delayMoveBars);
	Listeners.add(window, 'ToggledPuzzleBar', moveBars);
	Listeners.add(window, 'PuzzleBarCustomized', moveBars);
	Listeners.add(window, 'fullscreen', onFullScreen.listener);
	
	// Half fix for when the status-bar is changed
	Listeners.add(statusBar, 'load', delayMoveBars, true);
	
	moveBars();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(contextMenu, 'popupshowing', setContextMenu);
	Listeners.remove(viewMenu, 'popupshown', setViewMenu);
	Listeners.remove(customizeMenu, 'popupshown', setCustomizeMenu);
	Listeners.remove(browserPanel, 'resize', delayMoveBars);
	Listeners.remove(window, 'aftercustomization', delayMoveBars);
	Listeners.remove(window, 'ToggledPuzzleBar', moveBars);
	Listeners.remove(window, 'PuzzleBarCustomized', moveBars);
	Listeners.remove(window, 'fullscreen', onFullScreen.listener);
	Listeners.remove(statusBar, 'load', delayMoveBars, true);
	
	Messenger.unlistenWindow(window, 'DOMFullScreen', onFullScreen.listenDOM);
	Messenger.unloadFromWindow(window, 'initPuzzleBars');
	removeAttribute(document.documentElement, objName+'-fullscreen');
	removeAttribute(document.documentElement, objName+'-noAnimation');
	
	CustomizableUI.removeListener(barCustomized);
	
	Piggyback.revert('initAddonbar', PrintPreviewListener, '_hideChrome');
	Piggyback.revert('initAddonbar', PrintPreviewListener, '_showChrome');
	removeAttribute(document.documentElement, 'PrintPreview');
};
