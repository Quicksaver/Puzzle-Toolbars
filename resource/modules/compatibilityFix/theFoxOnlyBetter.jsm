Modules.VERSION = '2.0.2';

this.__defineGetter__('theFoxOnlyBetter', function() { return window.theFoxOnlyBetter; });
this.__defineGetter__('gNavToolbox', function() { return window.gNavToolbox; });

this.tFOB = {
	id: 'thefoxonlybetter@quicksaver',
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'LoadedSlimChrome':
			case 'UnloadedSlimChrome':
				this.enable();
				break;
			
			case 'LoadedPuzzleBar':
				this.moveBar(e);
				break;
			
			case 'ToggledPuzzleBar':
				if(Prefs.tFOB && Prefs.top_bar && typeof(top) != 'undefined' && e.target == top.bar) {
					toggleAttribute(theFoxOnlyBetter.slimChrome.container, 'topPuzzleBar', !Prefs.top_slimChrome && !top.bar.collapsed);
				}
				break;
			
			case 'WillShowSlimChrome':
				if(typeof(top) != 'undefined' && isAncestor(e.detail.originalTarget, top.PP)) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		this.moveBar();
	},
	
	onEnabled: function(addon) {
		if(addon.id == this.id) { this.enable(); }
	},
	
	onDisabled: function(addon) {
		if(addon.id == this.id) { this.disable(); }
	},
	
	listen: function() {
		AddonManager.addAddonListener(this);
		AddonManager.getAddonByID(this.id, (addon) => {
			if(addon && addon.isActive) { this.enable(); }
		});
	},
	
	unlisten: function() {
		AddonManager.removeAddonListener(this);
		this.disable();
	},
	
	enable: function() {
		// for our preferences dialog
		Prefs.tFOB = true;
		this.fix();
	},
	
	disable: function() {
		// for our preferences dialog
		Prefs.tFOB = false;
		this.fix();
	},
	
	fix: function() {
		if(Prefs.tFOB && theFoxOnlyBetter) {
			// for Slim Chrome to not move our toolbar if it shouldn't right from the start
			if(theFoxOnlyBetter.slimChromeExceptions) {
				if(!UNLOADED && !Prefs.top_slimChrome) {
					if(!theFoxOnlyBetter.slimChromeExceptions.has(objName+'-top-bar')) {
						theFoxOnlyBetter.slimChromeExceptions.add(objName+'-top-bar');
					}
				} else {
					if(theFoxOnlyBetter.slimChromeExceptions.has(objName+'-top-bar')) {
						theFoxOnlyBetter.slimChromeExceptions.delete(objName+'-top-bar');
					}
				}
			}
			
			if(theFoxOnlyBetter.slimChrome) {
				// so our UI is shown as it should depending on where the toolbar is
				if(Prefs.top_bar && typeof(top) != 'undefined' && top.bar) {
					var toggle = !UNLOADED && Prefs.top_slimChrome && isAncestor(top.bar, theFoxOnlyBetter.slimChrome.container);
					toggleAttribute(top.bar, 'slimChrome', toggle);
					toggleAttribute(theFoxOnlyBetter.slimChrome.container, 'topPuzzleBar', !toggle && !top.bar.collapsed);
				} else {
					removeAttribute(theFoxOnlyBetter.slimChrome.container, 'topPuzzleBar');
				}
			}
		}
		else if(typeof(top) != 'undefined') {
			removeAttribute(top.bar, 'slimChrome');
		}
	},
	
	moveBar: function(e) {
		if(!Prefs.tFOB || typeof(top) == 'undefined' || (e && e.target && e.target != top.bar)) { return; }
		
		this.enable();
		
		// in this case we need to move the toolbars ourselves if we need to, as we can't force Slim Chrome to move again
		if(top.bar && theFoxOnlyBetter && theFoxOnlyBetter.slimChrome) {
			if(Prefs.top_slimChrome && !isAncestor(top.bar, theFoxOnlyBetter.slimChrome.container)) {
				theFoxOnlyBetter.slimChrome.toolbars.appendChild(top.bar);
				if(gNavToolbox.externalToolbars.indexOf(top.bar) == -1) {
					gNavToolbox.externalToolbars.push(top.bar);
				}
				theFoxOnlyBetter.slimChrome.initOverflowable(top.bar);
				setAttribute(top.bar, 'slimChrome', 'true');
				removeAttribute(theFoxOnlyBetter.slimChrome.container, 'topPuzzleBar');
			}
			else if(!Prefs.top_slimChrome && isAncestor(top.bar, theFoxOnlyBetter.slimChrome.container)) {
				var i = gNavToolbox.externalToolbars.indexOf(top.bar);
				if(i != -1) {
					gNavToolbox.externalToolbars.splice(i, 1);
				}
				
				theFoxOnlyBetter.slimChrome.deinitOverflowable(top.bar);
				
				if(window.closed || window.willClose) {
					Overlays.safeMoveToolbar(top.bar, gNavToolbox);
				} else {
					gNavToolbox.appendChild(top.bar);
				}
				removeAttribute(top.bar, 'slimChrome');
				toggleAttribute(theFoxOnlyBetter.slimChrome.container, 'topPuzzleBar', !top.bar.collapsed);
			}
		}
	}
};

Modules.LOADMODULE = function() {
	// trigger a default state if tFOB is already loaded
	tFOB.disable();
	
	Listeners.add(window, 'LoadedSlimChrome', tFOB);
	Listeners.add(window, 'UnloadedSlimChrome', tFOB);
	Listeners.add(window, 'LoadedPuzzleBar', tFOB);
	Listeners.add(window, 'WillShowSlimChrome', tFOB);
	Listeners.add(window, 'ToggledPuzzleBar', tFOB);
	Prefs.listen('top_bar', tFOB);
	Prefs.listen('top_slimChrome', tFOB);
	
	tFOB.listen();
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'LoadedSlimChrome', tFOB);
	Listeners.remove(window, 'UnloadedSlimChrome', tFOB);
	Listeners.remove(window, 'LoadedPuzzleBar', tFOB);
	Listeners.remove(window, 'WillShowSlimChrome', tFOB);
	Listeners.remove(window, 'ToggledPuzzleBar', tFOB);
	Prefs.unlisten('top_bar', tFOB);
	Prefs.unlisten('top_slimChrome', tFOB);
	
	tFOB.unlisten();
};
