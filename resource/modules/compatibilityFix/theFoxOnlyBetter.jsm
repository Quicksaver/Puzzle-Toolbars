moduleAid.VERSION = '1.0.0';

this.__defineGetter__('theFoxOnlyBetter', function() { return window.theFoxOnlyBetter; });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });

this.slimChromeFixer = function(aEnabled) {
	// for our preferences dialog
	prefAid.tFOB = aEnabled;
	
	if(prefAid.tFOB && theFoxOnlyBetter) {
		// for Slim Chrome to not move our toolbar if it shouldn't right from the start
		if(theFoxOnlyBetter.slimChromeExceptions) {
			if(!UNLOADED && !prefAid.top_slimChrome) {
				if(theFoxOnlyBetter.slimChromeExceptions.indexOf(objName+'-top-bar') == -1) {
					theFoxOnlyBetter.slimChromeExceptions.push(objName+'-top-bar');
				}
			} else {
				var i = theFoxOnlyBetter.slimChromeExceptions.indexOf(objName+'-top-bar');
				if(i > -1) {
					theFoxOnlyBetter.slimChromeExceptions.splice(i, 1);
				}
			}
		}
		
		// so our UI is shown as it should depending on where the toolbar is
		if(prefAid.top_bar && typeof(topBar) != 'undefined') {
			var toggle = !UNLOADED && prefAid.top_slimChrome && isAncestor(topBar, theFoxOnlyBetter.slimChromeContainer);
			toggleAttribute(topBar, 'slimChrome', toggle);
			toggleAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar', !toggle && !topBar.collapsed);
		} else {
			removeAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar');
		}
	}
	else if(typeof(topBar) != 'undefined') {
		removeAttribute(topBar, 'slimChrome');
	}
};

this.slimChromePuzzleBarListener = function(e) {
	if(!prefAid.tFOB || typeof(topBar) == 'undefined' || (e.target && e.target != topBar)) { return; }
	
	slimChromeFixer(true);
	
	// in this case we need to move the toolbars ourselves if we need to, as we can't force Slim Chrome to move again
	if(topBar && theFoxOnlyBetter && theFoxOnlyBetter.slimChromeContainer) {
		if(prefAid.top_slimChrome && !isAncestor(topBar, theFoxOnlyBetter.slimChromeContainer)) {
			theFoxOnlyBetter.slimChromeToolbars.appendChild(topBar);
			if(gNavToolbox.externalToolbars.indexOf(topBar) == -1) {
				gNavToolbox.externalToolbars.push(topBar);
			}
			setAttribute(topBar, 'slimChrome', 'true');
			removeAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar');
		}
		else if(!prefAid.top_slimChrome && isAncestor(topBar, theFoxOnlyBetter.slimChromeContainer)) {
			var i = gNavToolbox.externalToolbars.indexOf(topBar);
			if(i != -1) {
				gNavToolbox.externalToolbars.splice(i, 1);
			}
			
			if(window.closed || window.willClose) {
				overlayAid.safeMoveToolbar(topBar, gNavToolbox);
			} else {
				gNavToolbox.appendChild(topBar);
			}
			removeAttribute(topBar, 'slimChrome');
			toggleAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar', !topBar.collapsed);
		}
	}
};

this.slimChromePuzzleBarToggled = function(e) {
	if(!prefAid.tFOB || !prefAid.top_bar || typeof(topBar) == 'undefined' || e.target != topBar) { return; }
	
	toggleAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar', !prefAid.top_slimChrome && !topBar.collapsed);
};

this.slimChromeShowListener = function(e) {
	if(typeof(topBar) == 'undefined') { return; }
	
	if(isAncestor(e.detail.originalTarget, topPP)) {
		e.preventDefault();
		e.stopPropagation();
	}
};
	
this.slimChromeListener = function(e) {
	slimChromeFixer(true);
};

this.theFoxOnlyBetterListener = {
	onEnabled: function(addon) {
		if(addon.id == 'thefoxonlybetter@quicksaver') { slimChromeFixer(true); }
	},
	onDisabled: function(addon) {
		if(addon.id == 'thefoxonlybetter@quicksaver') { slimChromeFixer(false); }
	}
};

moduleAid.LOADMODULE = function() {
	// trigger a default state if tFOB is already loaded
	slimChromeFixer(false);
	
	listenerAid.add(window, 'LoadedSlimChrome', slimChromeListener);
	listenerAid.add(window, 'UnloadedSlimChrome', slimChromeListener);
	listenerAid.add(window, 'LoadedPuzzleBar', slimChromePuzzleBarListener);
	listenerAid.add(window, 'WillShowSlimChrome', slimChromeShowListener);
	listenerAid.add(window, 'ToggledPuzzleBar', slimChromePuzzleBarToggled);
	prefAid.listen('top_bar', slimChromePuzzleBarListener);
	prefAid.listen('top_slimChrome', slimChromePuzzleBarListener);
	
	AddonManager.addAddonListener(theFoxOnlyBetterListener);
	AddonManager.getAddonByID('thefoxonlybetter@quicksaver', function(addon) {
		if(addon && addon.isActive) { slimChromeFixer(true); }
	});
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'LoadedSlimChrome', slimChromeListener);
	listenerAid.remove(window, 'UnloadedSlimChrome', slimChromeListener);
	listenerAid.remove(window, 'LoadedPuzzleBar', slimChromePuzzleBarListener);
	listenerAid.remove(window, 'WillShowSlimChrome', slimChromeShowListener);
	listenerAid.remove(window, 'ToggledPuzzleBar', slimChromePuzzleBarToggled);
	prefAid.unlisten('top_bar', slimChromePuzzleBarListener);
	prefAid.unlisten('top_slimChrome', slimChromePuzzleBarListener);
	AddonManager.removeAddonListener(theFoxOnlyBetterListener);
	
	slimChromeFixer(false);
};
