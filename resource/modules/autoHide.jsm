Modules.VERSION = '2.1.2';

this.onDragExitAll = function() {
	Listeners.remove(gBrowser, "dragenter", onDragExitAll, false);
	Listeners.remove(window, "drop", onDragExitAll, false);
	Listeners.remove(window, "dragend", onDragExitAll, false);
	
	for(var b in bars) {
		if(bars[b]._autohide) {
			setHover(bars[b], false);
		}
	}
};

this.setHover = function(bar, hover, force) {
	if(hover) {
		bar.hovers++;
		if(force != undefined && typeof(force) == 'number') {
			bar.hovers = force;
		}
	}
	else {
		if(force != undefined && typeof(force) == 'number') {
			bar.hovers = force;
		} else if(bar.hovers > 0) {
			bar.hovers--;
		}
	}
	
	Timers.init('setHover_'+bar.id, function() {
		toggleAttribute(bar, 'hover', bar.hovers > 0 && !bar.collapsed);
		dispatch(bar, { type: 'HoverAddonBar', cancelable: false });
	});
};

this.initialShowBar = function(e) {
	var bar = e.target;
	
	if(bar.collapsed) {
		setHover(bar, false, 0);
	} else {
		setHover(bar, true);
		
		// don't use Timers, because if we use multiple initialShowBar()'s it would get stuck open
		// we keep a reference to the timer, because otherwise sometimes it would not trigger (go figure...), hopefully this helps with that
		var thisShowing = aSync(function() {
			if(typeof(setHover) != 'undefined' && bar._initialShowings) {
				setHover(bar, false);
				bar._initialShowings.splice(bar._initialShowings.indexOf(thisShowing), 1);
			}
		}, 1500);
		bar._initialShowings.push(thisShowing);
	}
};

this.initialThroughButton = function(e) {
	if(e.target._bar && !e.target._bar.collapsed) {
		setHover(e.target._bar, true, 2);
	}
};

// Keep toolbar visible when opening menus within it
this.holdPopupNodes = [];
this.holdPopupMenu = function(e) {
	// don't do anything on tooltips! the UI might collapse altogether
	if(!e.target || e.target.nodeName == 'window' || e.target.nodeName == 'tooltip') { return; }
	
	var trigger = e.originalTarget.triggerNode;
	var target = e.target;
	
	// don't bother with any of this if the opened popup is a child of any currently opened panel
	for(p of holdPopupNodes) {
		if(target != p.popup && isAncestor(target, p.popup)) { return; }
	}
	
	// check if the trigger node is present in our toolbars;
	// there's no need to check the overflow panel here, as it will likely be open already in these cases
	var hold = null;
	for(var b in bars) {
		if(!bars[b]._autohide) { continue; }
		
		if(isAncestor(trigger, bars[b]) || isAncestor(trigger, bars[b]._pp) || isAncestor(e.originalTarget, bars[b])) {
			hold = bars[b];
			break;
		}
	}
	
	// try to use the anchor specified when opening the popup, if any; ditto from above for overflow panel nodes
	if(!hold && target.anchorNode) {
		for(var b in bars) {
			if(!bars[b]._autohide) { continue; }
			
			if(isAncestor(target.anchorNode, bars[b])) {
				hold = bars[b];
				break;
			}
		}
	}
	
	// could be a CUI panel opening, which doesn't carry a triggerNode, we have to find it ourselves
	if(!hold && !trigger) {
		if(target.id == 'customizationui-widget-panel') {
			barsLoop:
			for(var b in bars) {
				if(!bars[b]._autohide) { continue; }
				
				var widgets = CustomizableUI.getWidgetsInArea(b.id);
				for(var w=0; w<widgets.length; w++) {
					var widget = widgets[w].forWindow(window);
					if(!widget || !widget.node || !widget.node.open) { continue; }
					
					hold = bars[b];
					break barsLoop;
				}
			}
		}
		
		// let's just assume all panels that are children from these toolbars are opening from them
		else {
			for(var b in bars) {
				if(!bars[b]._autohide) { continue; }
				
				if(isAncestor(target, bars[b])) {
					hold = bars[b];
					
					// the search engine selection menu is an anonymous child of the searchbar: e.target == $('searchbar'),
					// so we need to explicitely get the actual menu to use
					if(target.id == 'searchbar') {
						target = document.getAnonymousElementByAttribute(target, 'anonid', 'searchbar-popup');
					}
					
					break;
				}
			}
		}
	}
	
	// nothing "native" is opening this popup, so let's see if someone claims it
	if(!hold) {
		trigger = askForOwner(target);
		if(trigger && typeof(trigger) == 'string') {
			trigger = $(trigger);
			
			if(trigger) {
				for(var b in bars) {
					if(!bars[b]._autohide) { continue; }
					
					// trigger could be either in the toolbars themselves or in the overflow panel
					if(isAncestor(trigger, bars[b]) || isAncestor(trigger, bars[b]._overflowTarget)) {
						hold = bars[b];
						break;
					}
				}
			}
		}
	}
	
	// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
	if(hold && target.state == 'open') {
		// if we're opening the toolbar now, the anchor may move, so we need to reposition the popup when it does
		holdPopupNodes.push(target);
		
		if(!trueAttribute(hold, 'hover')) {
			hideIt(target);
			hold._transition.add(popupsFinishedVisible);
			Timers.init('ensureHoldPopupShows', popupsFinishedVisible, 400);
		}
		
		setHover(hold, true);
		
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			Listeners.remove(target, 'popuphidden', selfRemover);
			popupsRemoveListeners();
			
			// making sure we don't collapse it permanently
			hideIt(target, true);
			
			setHover(hold, false);
			
			aSync(function() {
				if(typeof(holdPopupNodes) != 'undefined' && holdPopupNodes.indexOf(target) > -1) {
					holdPopupNodes.splice(holdPopupNodes.indexOf(target), 1);
				}
			}, 150);
		}
		Listeners.add(target, 'popuphidden', selfRemover);
	}
};

this.popupsRemoveListeners = function() {
	Timers.cancel('ensureHoldPopupShows');
	for(var b in bars) {
		if(bars[b]._autohide) {
			bars[b]._transition.remove(popupsFinishedVisible);
		}
	}
};

this.popupsFinishedVisible = function() {
	popupsRemoveListeners();
	if(holdPopupNodes.length > 0) {
		for(var popup of holdPopupNodes) {
			// don't bother if the popup was never hidden to begin with,
			// it's not needed (the toolbar was already visible when it opened), so the popup is already properly placed,
			// also this prevents some issues, for example the context menu jumping to the top left corner
			if(!popup.collapsed) { continue; }
			
			// obviously we won't need to move it if it isn't open
			if(popup.open || popup.state == 'open') {
				popup.moveTo(-1,-1);
				hideIt(popup, true);
			}
		}
		
		// in case opening the popup triggered the toolbar to show, and the mouse just so happens to be in that area, we need to make sure the mouse leaving
		// won't hide the toolbar with the popup still shown
		for(var b in bars) {
			if(!bars[b]._autohide || !trueAttribute(bars[b], 'hover')) { continue; }
			
			if(bars[b].hovers === 1 && $$('#'+b+':hover')[0]) {
				setHover(bars[b], true);
			}
		}
	}
};

this.initAutoHide = function(bar, nodes, transitionNode, transitionProperty) {
	if(bar._autohide) { return; }
	
	bar._autohide = [];
	bar._initialShowings = [];
	bar.hovers = 0;
	
	Listeners.add(bar, 'ToggledPuzzleBar', initialShowBar);
	Listeners.add(bar, 'PuzzleBarCustomized', initialShowBar);
	Listeners.add(bar._pp, 'ToggledPuzzleBarThroughButton', initialThroughButton);
	
	bar._onMouseOver = function() {
		setHover(bar, true);
	};
	
	bar._onMouseOut = function() {
		setHover(bar, false);
	};
	
	bar._onDragEnter = function() {
		setHover(bar, true, 1);
		Listeners.add(gBrowser, "dragenter", onDragExitAll, false);
		Listeners.add(window, "drop", onDragExitAll, false);
		Listeners.add(window, "dragend", onDragExitAll, false);
	};
	
	for(var node of nodes) {
		Listeners.add(node, 'dragenter', bar._onDragEnter);
		Listeners.add(node, 'mouseover', bar._onMouseOver);
		Listeners.add(node, 'mouseout', bar._onMouseOut);
		bar._autohide.push(node);
	}
	
	// for use to call certain methods when the bar is actually shown (after the CSS transition)
	bar._transition = {
		node: transitionNode,
		prop: transitionProperty,
		listeners: [],
		add: function(listener) {
			this.listeners.push(listener);
		},
		remove: function(listener) {
			if(this.listeners.indexOf(listener) > -1) {
				this.listeners.splice(this.listeners.indexOf(listener), 1);
			}
		}
	};
	bar._transition.onEnd = function(e) {
		if(e.target != bar._transition.node || e.propertyName != bar._transition.prop || !trueAttribute(bar, 'hover')) { return; }
		
		for(var listener of bar._transition.listeners) {
			try {
				listener(e);
			}
			catch(ex) { Cu.reportError(ex); }
		}
	};
	Listeners.add(bar._transition.node, 'transitionend', bar._transition.onEnd);
	
	setAttribute(bar, 'autohide', 'true');
	
	if(!Prefs.noInitialShow) {
		initialShowBar({ target: bar });
	}
};

this.deinitAutoHide = function(bar) {
	if(!bar._autohide) { return; }
	
	removeAttribute(bar, 'autohide');
	removeAttribute(bar, 'hover');
	
	for(var node of bar._autohide) {
		Listeners.remove(node, 'dragenter', bar._onDragEnter);
		Listeners.remove(node, 'mouseover', bar._onMouseOver);
		Listeners.remove(node, 'mouseout', bar._onMouseOut);
	}
	
	delete bar._onMouseOver;
	delete bar._onMouseOut;
	delete bar._onDragEnter;
	
	Listeners.remove(bar, 'ToggledPuzzleBar', initialShowBar);
	Listeners.remove(bar, 'PuzzleBarCustomized', initialShowBar);
	Listeners.remove(bar._pp, 'ToggledPuzzleBarThroughButton', initialThroughButton);
	
	Listeners.remove(bar._transition.node, 'transitionend', bar._transition.onEnd);
	delete bar._transition;
	
	delete bar.hovers;
	delete bar._initialShowings;
	delete bar._autohide;
};

Modules.LOADMODULE = function() {
	var fullscreenDefaults = {};
	fullscreenDefaults['fullscreen.autohide'] = true;
	Prefs.setDefaults(fullscreenDefaults, 'browser', '');
	
	Listeners.add(window, 'popupshown', holdPopupMenu);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'popupshown', holdPopupMenu);
};
