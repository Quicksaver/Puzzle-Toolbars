Modules.VERSION = '1.0.2';

this.__defineGetter__('theFoxOnlyBetter', function() { return window.theFoxOnlyBetter; });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });

this.slimChromeFixer = function(aEnabled) {
	// for our preferences dialog
	Prefs.tFOB = aEnabled;
	
	if(Prefs.tFOB && theFoxOnlyBetter) {
		// for Slim Chrome to not move our toolbar if it shouldn't right from the start
		if(theFoxOnlyBetter.slimChromeExceptions) {
			if(!UNLOADED && !Prefs.top_slimChrome) {
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
		if(Prefs.top_bar && typeof(topBar) != 'undefined' && topBar) {
			var toggle = !UNLOADED && Prefs.top_slimChrome && isAncestor(topBar, theFoxOnlyBetter.slimChromeContainer);
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
	if(!Prefs.tFOB || typeof(topBar) == 'undefined' || (e.target && e.target != topBar)) { return; }
	
	slimChromeFixer(true);
	
	// in this case we need to move the toolbars ourselves if we need to, as we can't force Slim Chrome to move again
	if(topBar && theFoxOnlyBetter && theFoxOnlyBetter.slimChromeContainer) {
		if(Prefs.top_slimChrome && !isAncestor(topBar, theFoxOnlyBetter.slimChromeContainer)) {
			theFoxOnlyBetter.slimChromeToolbars.appendChild(topBar);
			if(gNavToolbox.externalToolbars.indexOf(topBar) == -1) {
				gNavToolbox.externalToolbars.push(topBar);
			}
			theFoxOnlyBetter.slimChromeInitOverflowable(topBar);
			setAttribute(topBar, 'slimChrome', 'true');
			removeAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar');
		}
		else if(!Prefs.top_slimChrome && isAncestor(topBar, theFoxOnlyBetter.slimChromeContainer)) {
			var i = gNavToolbox.externalToolbars.indexOf(topBar);
			if(i != -1) {
				gNavToolbox.externalToolbars.splice(i, 1);
			}
			
			theFoxOnlyBetter.slimChromeDeinitOverflowable(topBar);
			
			if(window.closed || window.willClose) {
				Overlays.safeMoveToolbar(topBar, gNavToolbox);
			} else {
				gNavToolbox.appendChild(topBar);
			}
			removeAttribute(topBar, 'slimChrome');
			toggleAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar', !topBar.collapsed);
		}
	}
};

this.slimChromePuzzleBarToggled = function(e) {
	if(!Prefs.tFOB || !Prefs.top_bar || typeof(topBar) == 'undefined' || e.target != topBar) { return; }
	
	toggleAttribute(theFoxOnlyBetter.slimChromeContainer, 'topPuzzleBar', !Prefs.top_slimChrome && !topBar.collapsed);
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

Modules.LOADMODULE = function() {
	// trigger a default state if tFOB is already loaded
	slimChromeFixer(false);
	
	Listeners.add(window, 'LoadedSlimChrome', slimChromeListener);
	Listeners.add(window, 'UnloadedSlimChrome', slimChromeListener);
	Listeners.add(window, 'LoadedPuzzleBar', slimChromePuzzleBarListener);
	Listeners.add(window, 'WillShowSlimChrome', slimChromeShowListener);
	Listeners.add(window, 'ToggledPuzzleBar', slimChromePuzzleBarToggled);
	Prefs.listen('top_bar', slimChromePuzzleBarListener);
	Prefs.listen('top_slimChrome', slimChromePuzzleBarListener);
	
	AddonManager.addAddonListener(theFoxOnlyBetterListener);
	AddonManager.getAddonByID('thefoxonlybetter@quicksaver', function(addon) {
		if(addon && addon.isActive) { slimChromeFixer(true); }
	});
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSlimChrome', slimChromeListener);
	Listeners.remove(window, 'UnloadedSlimChrome', slimChromeListener);
	Listeners.remove(window, 'LoadedPuzzleBar', slimChromePuzzleBarListener);
	Listeners.remove(window, 'WillShowSlimChrome', slimChromeShowListener);
	Listeners.remove(window, 'ToggledPuzzleBar', slimChromePuzzleBarToggled);
	Prefs.unlisten('top_bar', slimChromePuzzleBarListener);
	Prefs.unlisten('top_slimChrome', slimChromePuzzleBarListener);
	AddonManager.removeAddonListener(theFoxOnlyBetterListener);
	
	slimChromeFixer(false);
};
