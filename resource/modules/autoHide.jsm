moduleAid.VERSION = '2.0.2';

this.onDragExitAll = function() {
	listenerAid.remove(gBrowser, "dragenter", onDragExitAll, false);
	listenerAid.remove(window, "drop", onDragExitAll, false);
	listenerAid.remove(window, "dragend", onDragExitAll, false);
	
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
	
	timerAid.init('setHover_'+bar.id, function() {
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
		
		// don't use timerAid, because if we use multiple initialShowBar()'s it would get stuck open
		// we keep a reference to the timer, because otherwise sometimes it would not trigger (go figure...), hopefully this helps with that
		var thisShowing = aSync(function() {
			if(typeof(setHover) != 'undefined' && bar._initialShowings) {
				setHover(bar, false);
				for(var i=0; i<bar._initialShowings.length; i++) {
					if(bar._initialShowings[i] == thisShowing) {
						bar._initialShowings.splice(i, 1);
						break;
					}
				}
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
this.holdPopupMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	var hold = null;
	
	// special case for the downloadsPanel
	if(e.target.id == 'downloadsPanel') {
		for(var b in bars) {
			if(isAncestor($('downloads-button'), bars[b])) {
				hold = bars[b];
				break;
			}
		}
	}
	
	// check if the trigger node is present in the addonBar
	if(!hold) {
		for(var b in bars) {
			if(isAncestor(trigger, bars[b]) || isAncestor(trigger, bars[b]._pp) || isAncestor(e.originalTarget, bars[b])) {
				hold = bars[b];
				break;
			}
		}
	}
	
	// could be a CUI panel opening, which doesn't carry a triggerNode, we have to find it ourselves
	if(!hold && !trigger && e.target.id == 'customizationui-widget-panel') {
		barsLoop:
		for(var b in bars) {
			for(var child of bars[b].childNodes) {
				if(child.open) {
					hold = bars[b];
					break barsLoop;
				}
			}
		}
	}
	
	// some menus, like NoScript's button menu, like to open multiple times (I think), or at least they don't actually open the first time... or something...
	if(hold && e.target.state == 'open') {
		setHover(hold, true);
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			setHover(hold, false);
			listenerAid.remove(e.target, 'popuphidden', selfRemover);
		}
		listenerAid.add(e.target, 'popuphidden', selfRemover);
	}
};

this.initAutoHide = function(bar, nodes) {
	if(bar.autohide) { return; }
	
	bar._autohide = [];
	bar._initialShowings = [];
	bar.hovers = 0;
	
	listenerAid.add(bar, 'ToggledPuzzleBar', initialShowBar);
	listenerAid.add(bar, 'PuzzleBarCustomized', initialShowBar);
	listenerAid.add(bar._pp, 'ToggledPuzzleBarThroughButton', initialThroughButton);
	
	bar._onMouseOver = function() {
		setHover(bar, true);
	};
	
	bar._onMouseOut = function() {
		setHover(bar, false);
	};
	
	bar._onDragEnter = function() {
		setHover(bar, true, 1);
		listenerAid.add(gBrowser, "dragenter", onDragExitAll, false);
		listenerAid.add(window, "drop", onDragExitAll, false);
		listenerAid.add(window, "dragend", onDragExitAll, false);
	};
	
	for(var node of nodes) {
		listenerAid.add(node, 'dragenter', bar._onDragEnter);
		listenerAid.add(node, 'mouseover', bar._onMouseOver);
		listenerAid.add(node, 'mouseout', bar._onMouseOut);
		bar._autohide.push(node);
	}
	
	setAttribute(bar, 'autohide', 'true');
	
	if(!prefAid.noInitialShow) {
		initialShowBar({ target: bar });
	}
};

this.deinitAutoHide = function(bar) {
	if(!bar._autohide) { return; }
	
	removeAttribute(bar, 'autohide');
	removeAttribute(bar, 'hover');
	
	for(var node of bar._autohide) {
		listenerAid.remove(node, 'dragenter', bar._onDragEnter);
		listenerAid.remove(node, 'mouseover', bar._onMouseOver);
		listenerAid.remove(node, 'mouseout', bar._onMouseOut);
	}
	
	listenerAid.remove(bar, 'ToggledPuzzleBar', initialShowBar);
	listenerAid.remove(bar, 'PuzzleBarCustomized', initialShowBar);
	listenerAid.remove(bar._pp, 'ToggledPuzzleBarThroughButton', initialThroughButton);
	
	delete bar.hovers;
	delete bar._initialShowings;
	delete bar._autohide;
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'popupshown', holdPopupMenu, false);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'popupshown', holdPopupMenu, false);
};
