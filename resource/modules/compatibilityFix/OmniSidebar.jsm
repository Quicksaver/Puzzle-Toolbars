// VERSION 2.0.5

this.__defineGetter__('omnisidebar', function() { return window.omnisidebar; });
this.__defineGetter__('leftSidebar', function() { return omnisidebar && omnisidebar.leftSidebar; });
this.__defineGetter__('rightSidebar', function() { return omnisidebar && omnisidebar.rightSidebar; });

this.osb = {
	id: 'osb@quicksaver',
	
	initialized: false,
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'IsSidebarOpen':
				e.stopPropagation();
				
				var sidebar = (Prefs.lateral_placement == 'left') ? leftSidebar : rightSidebar;
				if(!sidebar) { return; }
				e.detail = !sidebar.closed && !sidebar.above;
				break;
			
			case 'LoadedSidebar':
				if(leftSidebar && leftSidebar.box == e.target) {
					this.shouldFix(leftSidebar, rightSidebar, e.detail, 'left');
				} else {
					this.shouldFix(rightSidebar, leftSidebar, e.detail, 'right');
				}
				break;
			
			case 'LoadedAutoHidePuzzleBar':
				if(typeof(lateral) != 'undefined' && e.target == lateral.bar) {
					this.shouldFix(leftSidebar, rightSidebar, true, 'left');
					this.shouldFix(rightSidebar, leftSidebar, true, 'right');
				}
				break;
			
			case 'endToggleSidebar':
				if(typeof(lateral) != 'undefined') {
					lateral.sidebarOpen();
				}
				// no break;
			
			case 'beforecustomization':
			case 'aftercustomization':
			case 'LoadedAutoHidePuzzleBar':
			case 'UnloadedAutoHidePuzzleBar':
			case 'sidebarAbove':
			case 'sidebarDocked':
			case 'ToggledPuzzleBar':
				if(typeof(lateral) != 'undefined') {
					this.move(e);
				}
				break;
		}
	},
	
	observe: function(aSubject, aTopic, aData) {
		if(typeof(lateral) == 'undefined') { return; }
		
		switch(aSubject) {
			case 'twinSidebar':
			case 'renderabove':
			case 'renderaboveTwin':
				lateral.sidebarOpen();
				break;
			
			case 'moveSidebars':
				lateral.sidebarOpen();
				if(lateral.bar) {
					this.shouldFix(leftSidebar, rightSidebar, true, 'left');
					this.shouldFix(rightSidebar, leftSidebar, true, 'right');
				}
				break;
				
			case 'lateral_placement':
				if(lateral.bar) {
					this.shouldFix(leftSidebar, rightSidebar, true, 'left');
					this.shouldFix(rightSidebar, leftSidebar, true, 'right');
				}
				// no break;
			
			case 'lateral_bar':
			case 'lateral_autohide':
			case 'autoHide':
			case 'autoHideTwin':
				this.move();
				break;
		}
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
		if(this.initialized) { return; }
		this.initialized = true;
		
		// we need to access and follow some of OSB's preferences
		Prefs.setDefaults({
			moveSidebars: false,
			twinSidebar: false,
			renderabove: false,
			renderaboveTwin: false,
			autoHide: true,
			autoHideTwin: true
		}, 'omnisidebar');
		
		// stuff for the appearance fixes
		Prefs.listen('moveSidebars', this);
		Prefs.listen('twinSidebar', this);
		Prefs.listen('renderabove', this);
		Prefs.listen('renderaboveTwin', this);
		Prefs.listen('lateral_placement', this);
		Listeners.add(window, 'endToggleSidebar', this);
		Listeners.add(window, 'IsSidebarOpen', this);
		Listeners.add(window, 'LoadedSidebar', this);
		Listeners.add(window, 'LoadedAutoHidePuzzleBar', this);
		
		// stuff for moving the lateralBar into the sidebar
		Prefs.listen('lateral_bar', this);
		Prefs.listen('lateral_autohide', this);
		Prefs.listen('autoHide', this);
		Prefs.listen('autoHideTwin', this);
		Listeners.add(window, 'beforecustomization', this);
		Listeners.add(window, 'aftercustomization', this);
		Listeners.add(window, 'LoadedAutoHidePuzzleBar', this);
		Listeners.add(window, 'UnloadedAutoHidePuzzleBar', this);
		Listeners.add(window, 'endToggleSidebar', this);
		Listeners.add(window, 'sidebarAbove', this);
		Listeners.add(window, 'sidebarDocked', this);
		Listeners.add(window, 'ToggledPuzzleBar', this);
	},
	
	disable: function() {
		if(!this.initialized) { return; }
		this.initialized = false;
		
		Prefs.unlisten('moveSidebars', this);
		Prefs.unlisten('twinSidebar', this);
		Prefs.unlisten('renderabove', this);
		Prefs.unlisten('renderaboveTwin', this);
		Prefs.unlisten('lateral_placement', this);
		Listeners.remove(window, 'endToggleSidebar', this);
		Listeners.remove(window, 'IsSidebarOpen', this);
		Listeners.remove(window, 'LoadedSidebar', this);
		Listeners.remove(window, 'LoadedAutoHidePuzzleBar', this);
		
		Prefs.unlisten('lateral_bar', this);
		Prefs.unlisten('lateral_autohide', this);
		Prefs.unlisten('autoHide', this);
		Prefs.unlisten('autoHideTwin', this);
		Listeners.remove(window, 'beforecustomization', this);
		Listeners.remove(window, 'aftercustomization', this);
		Listeners.remove(window, 'LoadedAutoHidePuzzleBar', this);
		Listeners.remove(window, 'UnloadedAutoHidePuzzleBar', this);
		Listeners.remove(window, 'endToggleSidebar', this);
		Listeners.remove(window, 'sidebarAbove', this);
		Listeners.remove(window, 'sidebarDocked', this);
		Listeners.remove(window, 'ToggledPuzzleBar', this);
	},
	
	shouldFix: function(sidebar, other, setup, check) {
		if(Prefs.lateral_placement == check) {
			this.fix(sidebar, other, setup);
		}
	},
	
	// make sure OSB's side switcher triggers the lateral bar
	fix: function(sidebar, other, setup) {
		if(typeof(lateral) == 'undefined' || !lateral.bar || !lateral.bar._autohide) { return; }
		
		// the other (opposite) sidebar should never trigger the lateral bar to show
		if(other && other.switcher && lateral.bar._autohide.has(other.switcher)) {
			autoHide.setBarListeners(lateral.bar, other.switcher, false);
			lateral.bar._autohide.delete(other.switcher);
		}
		
		if(!sidebar) { return; }
		
		if(setup && Prefs.lateral_bar && (Prefs.lateral_autohide || onFullScreen.hideBars)) {
			if(sidebar.switcher && !lateral.bar._autohide.has(sidebar.switcher)) {
				autoHide.setBarListeners(lateral.bar, sidebar.switcher, true);
				lateral.bar._autohide.add(sidebar.switcher);
			}
		}
		else {
			if(sidebar.switcher && lateral.bar._autohide.has(sidebar.switcher)) {
				autoHide.setBarListeners(lateral.bar, sidebar.switcher, false);
				lateral.bar._autohide.delete(sidebar.switcher);
			}
		}
	},
	
	// if both the sidebar and the lateral bar are set to autohide, we physically move the lateral bar inside the sidebar,
	// so they behave as if they're the "same" interactive element
	move: function(e) {
		if(!lateral.bar) { return; }
		
		var sidebar = (Prefs.lateral_placement == 'left') ? leftSidebar : rightSidebar;
		
		if(sidebar && !customizing
		&&	(!e
			|| (e.type == 'ToggledPuzzleBar' && e.target == lateral.bar && !lateral.bar.collapsed)
			|| (e.type == 'LoadedAutoHidePuzzleBar' && e.target == lateral.bar)
			|| (e.type == 'UnloadedAutoHidePuzzleBar' && e.target != lateral.bar)
			|| (e.type != 'UnloadedAutoHidePuzzleBar' && e.type != 'beforecustomization' && e.type != 'sidebarDocked'))
		&& Prefs.lateral_bar && (Prefs.lateral_autohide || onFullScreen.hideBars) && !lateral.bar.collapsed
		&& sidebar.resizeBox && !sidebar.closed && sidebar.above && sidebar.autoHide) {
			if(!isAncestor(lateral.bar, sidebar.resizeBox)) {
				sidebar.resizeBox.insertBefore(lateral.bar, sidebar.resizeBox.firstChild);
				sidebar.resizeBox.insertBefore(lateral.PP, sidebar.resizeBox.firstChild);
				removeAttribute(lateral.bar, 'flex');
				setAttribute(lateral.bar, 'inSidebar', 'true');
				
				// if we're toggling the toolbar, we better show the sidebar
				if(e.type && e.type == 'ToggledPuzzleBar') {
					omnisidebar.autoHide.initialShow(sidebar);
				}
			}
		}
		else if(!isAncestor(lateral.bar, lateral.container)) {
			lateral.container.appendChild(lateral.bar);
			$('browser').appendChild(lateral.PP);
			setAttribute(lateral.bar, 'flex', '1');
			removeAttribute(lateral.bar, 'inSidebar');
			lateral.move();
		}
	}
};

Modules.LOADMODULE = function() {
	osb.listen();
};

Modules.UNLOADMODULE = function() {
	osb.unlisten();
};
