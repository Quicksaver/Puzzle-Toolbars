/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 3.0.10

this.autoHide = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'dragenter':
			case 'drop':
			case 'dragend':
				Listeners.remove(gBrowser, "dragenter", this, false);
				Listeners.remove(window, "drop", this, false);
				Listeners.remove(window, "dragend", this, false);

				for(let bar of bars) {
					if(bar._autohide) {
						this.setHover(bar, false);
					}
				}
				break;

			case 'PuzzleBarCustomized':
				// On startup some icons may be added to the toolbar after its been initialized with autoHide; e.g. LastPass's button (v3.2.42, restartless).
				// If the user flipped the noInitialShow pref, we shouldn't show the toolbars during those buttons initialization at startup.
				if(Timers.noInitialShowOnStartup) { break; }

			case 'ToggledPuzzleBar':
				this.initialShow(e.target);
				break;

			case 'ToggledPuzzleBarThroughButton':
				if(e.target._bar && !e.target._bar.collapsed) {
					this.setHover(e.target._bar, true, 2);
				}
				break;

			case 'popupshowing':
			case 'popupshown':
				this.holdPopupMenu(e);
				break;

			case 'transitionend':
				this.popupsFinishedVisible();
				break;
		}
	},

	setHover: function(bar, hover, force) {
		if(hover) {
			bar.hovers++;
			if(force !== undefined && typeof(force) == 'number') {
				bar.hovers = force;
			}
		}
		else {
			if(force !== undefined && typeof(force) == 'number') {
				bar.hovers = force;
			} else if(bar.hovers > 0) {
				bar.hovers--;
			}
		}

		Timers.init('setHover_'+bar.id, function() {
			toggleAttribute(bar, 'hover', bar.hovers > 0 && !bar.collapsed);
			dispatch(bar, { type: 'HoverPuzzleBar', cancelable: false });
		});
	},

	initialShow: function(bar, duration = 1500) {
		if(bar.collapsed) {
			this.setHover(bar, false, 0);
		} else {
			this.setHover(bar, true);

			// don't use Timers, because if we use multiple initialShow()'s it would get stuck open
			// we keep a reference to the timer, because otherwise sometimes it would not trigger (go figure...), hopefully this helps with that
			let thisShowing = aSync(() => {
				if(bar._initialShowings) {
					this.setHover(bar, false);
					bar._initialShowings.delete(thisShowing);
				}
			}, duration);
			bar._initialShowings.add(thisShowing);
		}
	},

	isBarShowing: function(bar) {
		return trueAttribute(bar, 'hover') || (self.urlbar && bar == urlbar.bar && Prefs.urlbar_whenfocused && !trueAttribute(gURLBar, 'focused'));
	},

	// Keep toolbar visible when opening menus within it
	hoveredPopup: null,
	holdPopupNodes: new Set(),
	releasePopups: new Map(),
	holdPopupMenu: function(e) {
		// don't do anything on tooltips! the UI might collapse altogether
		if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }

		// no need to do any of this if none of the toolbars are autohiding (or are closed)
		let proceed = false;
		for(let bar of bars) {
			if(bar._autohide && !bar.collapsed) {
				proceed = true;
				break;
			}
		}
		if(!proceed) { return; }

		var trigger = e.originalTarget.triggerNode;
		var target = e.target;

		// don't bother with any of this if the opened popup is a child of any currently opened panel
		for(let popup of this.holdPopupNodes) {
			if(target != popup && isAncestor(target, popup)) { return; }
		}

		// check if the trigger node is present in our toolbars;
		// there's no need to check the overflow panel here, as it will likely be open already in these cases
		var hold = null;
		for(let bar of bars) {
			if(!bar._autohide) { continue; }

			if(isAncestor(trigger, bar) || isAncestor(trigger, bar._pp) || isAncestor(e.originalTarget, bar)) {
				hold = bar;
				break;
			}
		}

		// try to use the anchor specified when opening the popup, if any; ditto from above for overflow panel nodes
		if(!hold && target.anchorNode) {
			for(let bar of bars) {
				if(!bar._autohide) { continue; }

				if(isAncestor(target.anchorNode, bar)) {
					hold = bar;
					break;
				}
			}
		}

		// could be a CUI panel opening, which doesn't carry a triggerNode, we have to find it ourselves
		if(!hold && !trigger) {
			if(target.id == 'customizationui-widget-panel') {
				barsLoop: for(let bar of bars) {
					if(!bar._autohide) { continue; }

					var widgets = CustomizableUI.getWidgetsInArea(bar.id);
					for(let w of widgets) {
						var widget = w && w.forWindow(window);
						if(!widget || !widget.node || !widget.node.open) { continue; }

						hold = bar;
						break barsLoop;
					}
				}
			}

			// let's just assume all panels that are children from these toolbars are opening from them
			else {
				for(let bar of bars) {
					if(!bar._autohide) { continue; }

					if(isAncestor(target, bar)) {
						hold = bar;

						// the search engine selection menu is an anonymous child of the searchbar: e.target == $('searchbar'),
						// so we need to explicitely get the actual menu to use
						if(target.id == 'searchbar') {
							target = $ª(target, 'searchbar-popup');
						}

						break;
					}
				}
			}
		}

		// nothing "native" is opening this popup, so let's see if someone claims it
		if(!hold) {
			trigger = dispatch(target, { type: 'AskingForNodeOwner', asking: true });
			if(trigger && typeof(trigger) == 'string') {
				trigger = $(trigger);

				if(trigger) {
					for(let bar of bars) {
						if(!bar._autohide) { continue; }

						// trigger could be either in the toolbars themselves or in the overflow panel
						if(isAncestor(trigger, bar) || isAncestor(trigger, bar._overflowTarget)) {
							hold = bar;
							break;
						}
					}
				}
			}
		}

		// Similarly to the 'click' handler below,
		// popups shouldn't flash or jump around because the toolbars are temporarily hidden before the popup is fully shown.
		if(e.type == 'popupshowing') {
			if(this.isBarShowing(hold)) {
				this.initialShow(hold, 500);
			}
			return;
		}

		// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
		// The bar can be hidden here in case we click, for instance, its puzzle piece, in which case we can't very well show it (nor would we need to).
		if(hold && !hold.collapsed && target.state == 'open') {
			// if we're opening the toolbar now, the anchor may move, so we need to reposition the popup when it does
			this.holdPopupNodes.add(target);

			// make sure the popup stays in the set, so that ones that open and close quickly
			// (i.e. multiple dis/allow actions in NoScript's popup) aren't removed while they're still open
			if(this.releasePopups.has(target)) {
				this.releasePopups.get(target).cancel();
				this.releasePopups.delete(target);
			}

			if(!this.isBarShowing(hold)) {
				target.collapsed = true;
				hold._transition.add(this);
				Timers.init('ensureHoldPopupShows', () => { this.popupsFinishedVisible(); }, 400);
			}

			this.setHover(hold, true);

			let selfRemover = (ee) => {
				if(ee.originalTarget != e.originalTarget) { return; } //submenus
				Listeners.remove(target, 'popuphidden', selfRemover);

				this.popupsRemoveListeners();
				if(this.hoveredPopup == target) {
					// it's unlikely that a mouseout will occur once the popup is hidden,
					// so make sure to undo whatever mouseover event hovered the popup
					this.setHover(hold, false);

					this.hoveredPopup = null;
				}

				// making sure we don't collapse it permanently
				target.collapsed = false;

				this.setHover(hold, false);

				this.releasePopups.set(target, aSync(() => {
					this.holdPopupNodes.delete(target);
				}, 150));
			}
			Listeners.add(target, 'popuphidden', selfRemover);
		}
	},

	popupsRemoveListeners: function() {
		Timers.cancel('ensureHoldPopupShows');
		for(let bar of bars) {
			if(bar._autohide) {
				bar._transition.remove(this);
			}
		}
	},

	popupsFinishedVisible: function() {
		this.popupsRemoveListeners();
		if(this.holdPopupNodes.size > 0) {
			for(let popup of this.holdPopupNodes) {
				// don't bother if the popup was never hidden to begin with,
				// it's not needed (the toolbar was already visible when it opened), so the popup is already properly placed,
				// also this prevents some issues, for example the context menu jumping to the top left corner
				if(!popup.collapsed) { continue; }

				// obviously we won't need to move it if it isn't open
				if(popup.open || popup.state == 'open') {
					popup.moveTo(-1,-1);
					popup.collapsed = false;
				}
			}

			// in case opening the popup triggered the toolbar to show, and the mouse just so happens to be in that area, we need to make sure the mouse leaving
			// won't hide the toolbar with the popup still shown
			for(let bar of bars) {
				if(!bar._autohide || !trueAttribute(bar, 'hover')) { continue; }

				if(bar.hovers === 1 && $$('#'+bar.id+':hover')[0]) {
					this.setHover(bar, true);
				}
			}
		}
	},

	setBarListeners: function(bar, node, setup) {
		if(setup) {
			Listeners.add(node, 'dragenter', bar);
			Listeners.add(node, 'mouseover', bar);
			Listeners.add(node, 'mouseout', bar);
			Listeners.add(node, 'click', bar);
		} else {
			Listeners.remove(node, 'dragenter', bar);
			Listeners.remove(node, 'mouseover', bar);
			Listeners.remove(node, 'mouseout', bar);
			Listeners.remove(node, 'click', bar);
		}
	},

	init: function(bar, nodes, transitionNode, transitionProperty) {
		if(bar._autohide) { return; }

		bar._autohide = new Set();
		bar._initialShowings = new Set();
		bar.hovers = 0;

		Listeners.add(bar, 'ToggledPuzzleBar', this);
		Listeners.add(bar, 'PuzzleBarCustomized', this);
		Listeners.add(bar._pp, 'ToggledPuzzleBarThroughButton', this);

		bar.handleEvent = function(e) {
			switch(e.type) {
				case 'dragenter':
					autoHide.setHover(this, true, 1);
					Listeners.add(gBrowser, "dragenter", autoHide, false);
					Listeners.add(window, "drop", autoHide, false);
					Listeners.add(window, "dragend", autoHide, false);
					break;

				case 'mouseover':
					// Try not to double-mouseover items in child popups, otherwise it could lead to the toolbar getting stuck open.
					// For instance, NoScript's "dis/allow scripts on this page" changes the DOM of the popup, where hovered items could
					// be removed without triggering a mouseout event, leading to a subsequent mouseover on new/moved items.
					if(isAncestor(e.target, autoHide.hoveredPopup)) { break; }
					for(let popup of autoHide.holdPopupNodes) {
						if(isAncestor(e.target, popup)) {
							autoHide.hoveredPopup = popup;
							break;
						}
					}

					autoHide.setHover(this, true);
					break;

				case 'mouseout':
					// see note above about preventing double-mouseovers
					if(isAncestor(e.target, autoHide.hoveredPopup)) {
						autoHide.hoveredPopup = null;
					}

					autoHide.setHover(this, false);
					break;

				case 'transitionend':
					if(e.target != this._transition.node || e.propertyName != this._transition.prop || !trueAttribute(this, 'hover')) { break; }

					for(let listener of this._transition.listeners) {
						try {
							if(listener.handleEvent) {
								listener.handleEvent(e);
							} else {
								listener(e);
							}
						}
						catch(ex) { Cu.reportError(ex); }
					}
					break;

				case 'click':
					// When pressing a button in the toolbar while keeping the mouse moving, it's possible the mouse would leave the toolbar
					// before a popup is opened. So the toolbar would temporarily start to hide because it is only stuck open *after*
					// the popup is finished opening. This would cause some visual glitches in the popups, like them flashing, showing only the borders,
					// or jumping to the top-left edge of the window.
					autoHide.initialShow(this, 500);
					break;
			}
		};

		for(let node of nodes) {
			this.setBarListeners(bar, node, true);
			bar._autohide.add(node);
		}

		// for use to call certain methods when the bar is actually shown (after the CSS transition)
		bar._transition = {
			node: transitionNode,
			prop: transitionProperty,
			listeners: new Set(),
			add: function(listener) {
				this.listeners.add(listener);
			},
			remove: function(listener) {
				this.listeners.delete(listener);
			}
		};
		Listeners.add(bar._transition.node, 'transitionend', bar);

		setAttribute(bar, 'autohide', 'true');
		dispatch(bar, { type: "LoadedAutoHidePuzzleBar", cancelable: false });

		if(!Prefs.noInitialShow) {
			this.initialShow(bar);
		}
	},

	deinit: function(bar) {
		if(!bar._autohide) { return; }

		removeAttribute(bar, 'autohide');
		removeAttribute(bar, 'hover');
		dispatch(bar, { type: "UnloadedAutoHidePuzzleBar", cancelable: false });

		for(let node of bar._autohide) {
			this.setBarListeners(bar, node, false);
		}

		Listeners.remove(bar, 'ToggledPuzzleBar', this);
		Listeners.remove(bar, 'PuzzleBarCustomized', this);
		Listeners.remove(bar._pp, 'ToggledPuzzleBarThroughButton', this);
		Listeners.remove(bar._transition.node, 'transitionend', bar);

		delete bar._transition;
		delete bar.handleEvent;
		delete bar.hovers;
		delete bar._initialShowings;
		delete bar._autohide;
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'popupshowing', autoHide);
	Listeners.add(window, 'popupshown', autoHide);

	if(Prefs.noInitialShow) {
		Timers.init("noInitialShowOnStartup", function() {}, 4000);
	}
};

Modules.UNLOADMODULE = function() {
	Timers.cancel("noInitialShowOnStartup");

	for(let bar of bars) {
		Timers.cancel('setHover_'+bar.id);
	}
	Listeners.remove(window, 'popupshowing', autoHide);
	Listeners.remove(window, 'popupshown', autoHide);
};
