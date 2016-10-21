/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 3.0.9

this.__defineGetter__('PrintPreviewListener', function() { return window.PrintPreviewListener; });
this.__defineGetter__('gNavBar', function() { return $('nav-bar'); });
this.__defineGetter__('statusBar', function() { return _statusBar.node || $('status-bar'); });
this.__defineGetter__('customizeMenu', function() { return $('customization-toolbar-menu'); });
this.__defineGetter__('viewMenu', function() { return $('viewToolbarsMenu').firstChild; });
this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });
this.__defineGetter__('PlacesToolbarHelper', function() { return window.PlacesToolbarHelper; });

// trick to find out the acurate width of the vertical scrollbar
this._scrollBarWidth = null;
this.__defineGetter__('scrollBarWidth', function() {
	if(_scrollBarWidth === null) {
		var scrollDiv = document.createElement("div");
		scrollDiv.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position: fixed; top: -9999px;');
		scrollDiv = $('browser-panel').appendChild(scrollDiv);
		_scrollBarWidth = 100 -scrollDiv.clientWidth;
		scrollDiv.remove();
	}
	return _scrollBarWidth;
});

// some bars need to properly force autohide on when in full screen, this is just a helper to ease this process
this.onFullScreen = {
	handlers: new Set(),

	// just a shortcut for the properties below to facilitate everywhere else
	get hideBars () { return !this.useLion && this.entered && this.autohide; },

	get fullscreenElement() {
		if(Services.vc.compare(Services.appinfo.version, "47.0a1") < 0) {
			return document.mozFullScreen;
		}
		return document.fullscreenElement;
	},
	get useLion () { return window.FullScreen.useLionFullScreen; },
	get autohide () { return Prefs['fullscreen.autohide']; },

	// we don't care when entering DOM fullscreen, everything is hidden there, so no use in de/initializing anything
	entered: window.fullScreen && !this.fullscreenElement,

	add: function(h) {
		this.handlers.add(h);
	},

	remove: function(h) {
		this.handlers.delete(h);
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'fullscreen':
				// prevent the toolbars from moving around when entering or leaving fullscreen mode
				this.noAnimation();

				let inFullScreen = window.fullScreen && !this.fullscreenElement;

				// only call the handlers if there was a change
				if(inFullScreen == this.entered) { return; }
				this.entered = inFullScreen;

				// Firefox's fullscreen handler removes the context menu from these toolbars, for old reasons (bug 1213598)
				if(this.entered) {
					for(let bar of bars) {
						if(!bar.hasAttribute('context') && bar.hasAttribute('saved-context')) {
							bar.setAttribute('context', bar.getAttribute('saved-context'));
						}
					}
				}

				for(let h of this.handlers) {
					if(h.handleEvent) {
						h.handleEvent(e);
					} else {
						h(e);
					}
				}
				break;
		}
	},

	noAnimation: function() {
		setAttribute(document.documentElement, objName+'-noAnimation', 'true');
		Timers.init('noAnimation', function() {
			removeAttribute(document.documentElement, objName+'-noAnimation');
		}, 0);
	}
};

this.bars = {
	_bars: new Map(),
	[Symbol.iterator]: function* () {
		for(let bar of this._bars.values()) {
			yield bar;
		}
	},

	get: function(id) {
		return this._bars.get(id);
	},

	onWidgetAdded: function(aWidget, aArea) { this.widgetCustomized(aWidget, aArea); },
	onWidgetRemoved: function(aWidget, aArea) { this.widgetCustomized(aWidget, aArea); },

	handleEvent: function(e) {
		switch(e.type) {
			case 'toolbarvisibilitychange':
				if(this._bars.has(e.target.id)) {
					aSync(() => { dispatch(this._bars.get(e.target.id), { type: 'ToggledPuzzleBar', cancelable: false }); });
				}
				break;

			// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
			case 'popupshowing':
				this.setContextMenu(e);
			case 'popupshown':
				this.setMenuEntries(e.target);
				break;

			case 'resize':
			case 'drop':
			case 'load':
			case 'aftercustomization':
				this.delayMove();
				break;

			case 'ToggledPuzzleBar':
			case 'PuzzleBarCustomized':
				this.move();
				break;
		}
	},

	init: function(bar, pp) {
		if(this._bars.has(bar.id)) { return; }

		this._bars.set(bar.id, bar);
		bar._pp = pp;
		pp._bar = bar;

		if(trueAttribute(bar, 'overflowable') && bar.getAttribute('overflowtarget')) {
			bar._overflowTarget = $(bar.getAttribute('overflowtarget'));
		}

		Listeners.add(bar, 'resize', this);
		Listeners.add(bar, 'drop', this);
		Listeners.add(bar, 'load', this);

		// bars.move won't fire when setting hidden/collapsed in the buttons, unless we make it follow these changes
		bar._moveOnHidingAttr = new window.MutationObserver((mutations) => {
			// we don't need to schedule for every difference, we only need to schedule if there is any
			for(let m of mutations) {
				if(m.oldValue != m.target.getAttribute(m.attributeName)) {
					// the mutation observer already fires on a "delay" after the attr changes take place,
					// so there's no need to further delay on our side
					this.move();
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

		bar._loaded = true;

		// aSync works best
		aSync(function() {
			bar.hidden = false;

			// up until now the bar was hidden, the places toolbar interprets this as "don't initialize"
			if(isAncestor(PlacesToolbarHelper._viewElt, bar)) {
				PlacesToolbarHelper.init();
			}
		});

		dispatch(bar, { type: "LoadedPuzzleBar", cancelable: false });
	},

	deinit: function(bar, pp) {
		if(!this._bars.has(bar.id)) { return; }

		// Prevent things from jumping around on startup
		bar.hidden = true;
		delete bar._loaded;
		dispatch(bar, { type: "UnloadedPuzzleBar", cancelable: false });

		bar._moveOnHidingAttr.disconnect();

		Listeners.remove(bar, 'resize', this);
		Listeners.remove(bar, 'drop', this);
		Listeners.remove(bar, 'load', this);

		delete bar._overflowTarget;
		delete pp._bar;
		delete bar._moveOnHidingAttr;
		delete bar._pp;
		this._bars.delete(bar.id);
	},

	toggle: function(aId) {
		if(this._bars.has(aId)) {
			CustomizableUI.setToolbarVisibility(aId, this._bars.get(aId).collapsed);
		}
	},

	widgetCustomized: function(aWidget, aArea) {
		if(this._bars.has(aArea) && !trueAttribute(this._bars.get(aArea), 'customizing')) {
			dispatch(this._bars.get(aArea), { type: 'PuzzleBarCustomized', cancelable: false });
		}
	},

	// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
	setContextMenu: function(e) {
		var notHidden = false;
		for(let bar of this) {
			if(isAncestor(e.originalTarget.triggerNode, bar) || isAncestor(e.originalTarget.triggerNode, bar._pp)) {
				notHidden = true;
				break;
			}
		}
		toggleAttribute(contextOptions, 'hidden', !notHidden);
		toggleAttribute(contextSeparator, 'hidden', !notHidden);
	},

	setMenuEntries:function(menu) {
		for(let bar of this) {
			setAttribute(menu.getElementsByAttribute('toolbarId', bar.id)[0], 'command', bar.getAttribute('menucommand'));
		}
	},

	delayMove: function() {
		Timers.init('delayMoveAddonBar', () => { this.move(); }, 0);
	},

	move: function() {
		// there's no point in doing all this in customize mode
		if(customizing) { return; }

		dispatch(window, { type: "PuzzleBarsMoved", cancelable: false });

		// if the bars change sizes (from customization for instance, or as a consequence of themselves being moved), make sure we keep their placement accurate
		for(let bar of this) {
			let lastSize = {
				bar: bar,
				height: bar.clientHeight +(bar.clientTop *2),
				width: bar.clientWidth +(bar.clientLeft *2)
			};
			Timers.init('reMoveBar-'+bar.id, () => {
				if(!UNLOADED) {
					let bar = lastSize.bar;
					let nowSize = {
						height: bar.clientHeight +(bar.clientTop *2),
						width: bar.clientWidth +(bar.clientLeft *2)
					};
					if(lastSize.width != nowSize.width || lastSize.height != nowSize.height) {
						this.move();
					}
				}
			}, 500);
		}
	}
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

	CustomizableUI.addListener(bars);

	var fullscreenDefaults = {};
	fullscreenDefaults['fullscreen.autohide'] = true;
	Prefs.setDefaults(fullscreenDefaults, 'browser', '');

	Listeners.add(contextMenu, 'popupshowing', bars);
	Listeners.add(viewMenu, 'popupshown', bars);
	Listeners.add(customizeMenu, 'popupshown', bars);
	Listeners.add(window, 'resize', bars);
	Listeners.add(window, 'aftercustomization', bars);
	Listeners.add(window, 'toolbarvisibilitychange', bars);
	Listeners.add(window, 'ToggledPuzzleBar', bars);
	Listeners.add(window, 'PuzzleBarCustomized', bars);
	Listeners.add(window, 'fullscreen', onFullScreen);

	// Half fix for when the status-bar is changed
	Listeners.add(statusBar, 'load', bars, true);

	bars.move();
};

Modules.UNLOADMODULE = function() {
	Timers.cancel('noAnimation');

	Listeners.remove(contextMenu, 'popupshowing', bars);
	Listeners.remove(viewMenu, 'popupshown', bars);
	Listeners.remove(customizeMenu, 'popupshown', bars);
	Listeners.remove(window, 'resize', bars);
	Listeners.remove(window, 'aftercustomization', bars);
	Listeners.remove(window, 'toolbarvisibilitychange', bars);
	Listeners.remove(window, 'ToggledPuzzleBar', bars);
	Listeners.remove(window, 'PuzzleBarCustomized', bars);
	Listeners.remove(window, 'fullscreen', onFullScreen);
	Listeners.remove(statusBar, 'load', bars, true);

	removeAttribute(document.documentElement, objName+'-noAnimation');

	CustomizableUI.removeListener(bars);

	Piggyback.revert('initAddonbar', PrintPreviewListener, '_hideChrome');
	Piggyback.revert('initAddonbar', PrintPreviewListener, '_showChrome');
	removeAttribute(document.documentElement, 'PrintPreview');
};
