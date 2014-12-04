Modules.VERSION = '1.0.1';

this.__defineGetter__('omnisidebar', function() { return window.omnisidebar; });
this.__defineGetter__('leftSidebar', function() { return omnisidebar.leftSidebar; });
this.__defineGetter__('rightSidebar', function() { return omnisidebar.rightSidebar; });

this.osbLateralSidebarOpenListener = function() {
	if(typeof(lateralSidebarOpen) != 'undefined') {
		lateralSidebarOpen();
	}
};

this.osbIsSidebarOpen = function(e) {
	e.stopPropagation();
	
	var sidebar = (Prefs.lateral_placement == 'left') ? leftSidebar : rightSidebar;
	e.detail = !sidebar.closed && !sidebar.above;
};

// make sure OSB's side switcher triggers the lateral bar
this.osbSetSwitcher = function(sidebar, other, setup) {
	if(typeof(lateralBar) == 'undefined' || !lateralBar || !lateralBar._autohide) { return; }
	
	// the other (opposite) sidebar should never trigger the lateral bar to show
	if(other.switcher && lateralBar._autohide.indexOf(other.switcher) > -1) {
		autoHideNodeListeners(lateralBar, other.switcher, false);
		lateralBar._autohide.splice(lateralBar._autohide.indexOf(other.switcher), 1);
	}
	
	if(setup && Prefs.lateral_bar && Prefs.lateral_autohide) {
		if(sidebar.switcher && lateralBar._autohide.indexOf(sidebar.switcher) == -1) {
			autoHideNodeListeners(lateralBar, sidebar.switcher, true);
			lateralBar._autohide.push(sidebar.switcher);
		}
	}
	else {
		if(sidebar.switcher && lateralBar._autohide.indexOf(sidebar.switcher) > -1) {
			autoHideNodeListeners(lateralBar, sidebar.switcher, false);
			lateralBar._autohide.splice(lateralBar._autohide.indexOf(sidebar.switcher), 1);
		}
	}
};

this.osbLoadListener = function(e) {
	if(leftSidebar && leftSidebar.box == e.target) {
		var sidebar = leftSidebar;
		var other = rightSidebar;
		var check = 'left';
	} else {
		var sidebar = rightSidebar;
		var other = leftSidebar;
		var check = 'right';
	}
	
	if(Prefs.lateral_placement == check) {
		osbSetSwitcher(sidebar, other, e.detail);
	}
};

this.osbLateralAutoHideListener = function(e) {
	if(typeof(lateralBar) != 'undefined' && e.target == lateralBar) {
		if(Prefs.lateral_placement == 'left') {
			var sidebar = leftSidebar;
			var other = rightSidebar;
		} else {
			var sidebar = rightSidebar;
			var other = leftSidebar;
		}
		osbSetSwitcher(sidebar, other, true);
	}
};

this.osbLateralPlacementListener = function() {
	if(typeof(lateralBar) != 'undefined' && lateralBar) {
		osbLateralAutoHideListener({ target: lateralBar });
	}
};

// if both the sidebar and the lateral bar are set to autohide, we physically move the lateral bar inside the sidebar, so they behave as if they're the "same" interactive element
this.osbMoveLateral = function(e) {
	if(typeof(lateralBar) == 'undefined' || !lateralBar) { return; }
	
	var sidebar = (Prefs.lateral_placement == 'left') ? leftSidebar : rightSidebar;
	
	if(!customizing
	&&	(!e
		|| (e.type == 'ToggledPuzzleBar' && e.target == lateralBar && !lateralBar.collapsed)
		|| (e.type == 'LoadedAutoHidePuzzleBar' && e.target == lateralBar)
		|| (e.type == 'UnloadedAutoHidePuzzleBar' && e.target != lateralBar)
		|| (e.type != 'UnloadedAutoHidePuzzleBar' && e.type != 'beforecustomization' && e.type != 'sidebarDocked'))
	&& Prefs.lateral_bar && (Prefs.lateral_autohide || onFullScreen.hideBars) && !lateralBar.collapsed
	&& sidebar.resizeBox && !sidebar.closed && sidebar.above && sidebar.autoHide) {
		if(!isAncestor(lateralBar, sidebar.resizeBox)) {
			sidebar.resizeBox.insertBefore(lateralBar, sidebar.resizeBox.firstChild);
			sidebar.resizeBox.insertBefore(lateralPP, sidebar.resizeBox.firstChild);
			removeAttribute(lateralBar, 'flex');
			setAttribute(lateralBar, 'inSidebar', 'true');
			
			// if we're toggling the toolbar, we better show the sidebar
			if(e && e.type == 'ToggledPuzzleBar') {
				omnisidebar.initialShowBar(sidebar, 1500);
			}
		}
	}
	else if(!isAncestor(lateralBar, lateralContainer)) {
		lateralContainer.appendChild(lateralBar);
		$('browser').appendChild(lateralPP);
		setAttribute(lateralBar, 'flex', '1');
		removeAttribute(lateralBar, 'inSidebar');
		lateralMove();
	}
};

this.osbFixer = function(loaded) {
	if(loaded) {
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
		Prefs.listen('moveSidebars', osbLateralSidebarOpenListener);
		Prefs.listen('twinSidebar', osbLateralSidebarOpenListener);
		Prefs.listen('renderabove', osbLateralSidebarOpenListener);
		Prefs.listen('renderaboveTwin', osbLateralSidebarOpenListener);
		Prefs.listen('lateral_placement', osbLateralPlacementListener);
		Prefs.listen('moveSidebars', osbLateralPlacementListener);
		Listeners.add(window, 'endToggleSidebar', osbLateralSidebarOpenListener);
		Listeners.add(window, 'IsSidebarOpen', osbIsSidebarOpen);
		Listeners.add(window, 'LoadedSidebar', osbLoadListener);
		Listeners.add(window, 'LoadedAutoHidePuzzleBar', osbLateralAutoHideListener);
		
		// stuff for moving the lateralBar into the sidebar
		Prefs.listen('lateral_bar', osbMoveLateral);
		Prefs.listen('lateral_autohide', osbMoveLateral);
		Prefs.listen('lateral_placement', osbMoveLateral);
		Prefs.listen('autoHide', osbMoveLateral);
		Prefs.listen('autoHideTwin', osbMoveLateral);
		Listeners.add(window, 'beforecustomization', osbMoveLateral);
		Listeners.add(window, 'aftercustomization', osbMoveLateral);
		Listeners.add(window, 'LoadedAutoHidePuzzleBar', osbMoveLateral);
		Listeners.add(window, 'UnloadedAutoHidePuzzleBar', osbMoveLateral);
		Listeners.add(window, 'endToggleSidebar', osbMoveLateral);
		Listeners.add(window, 'sidebarAbove', osbMoveLateral);
		Listeners.add(window, 'sidebarDocked', osbMoveLateral);
		Listeners.add(window, 'ToggledPuzzleBar', osbMoveLateral);
	} else {
		Prefs.unlisten('moveSidebars', osbLateralSidebarOpenListener);
		Prefs.unlisten('twinSidebar', osbLateralSidebarOpenListener);
		Prefs.unlisten('renderabove', osbLateralSidebarOpenListener);
		Prefs.unlisten('renderaboveTwin', osbLateralSidebarOpenListener);
		Prefs.unlisten('lateral_placement', osbLateralPlacementListener);
		Prefs.unlisten('moveSidebars', osbLateralPlacementListener);
		Listeners.remove(window, 'endToggleSidebar', osbLateralSidebarOpenListener);
		Listeners.remove(window, 'IsSidebarOpen', osbIsSidebarOpen);
		Listeners.remove(window, 'LoadedSidebar', osbLoadListener);
		Listeners.remove(window, 'LoadedAutoHidePuzzleBar', osbLateralAutoHideListener);
		
		Prefs.unlisten('lateral_bar', osbMoveLateral);
		Prefs.unlisten('lateral_autohide', osbMoveLateral);
		Prefs.unlisten('lateral_placement', osbMoveLateral);
		Prefs.unlisten('autoHide', osbMoveLateral);
		Prefs.unlisten('autoHideTwin', osbMoveLateral);
		Listeners.remove(window, 'beforecustomization', osbMoveLateral);
		Listeners.remove(window, 'aftercustomization', osbMoveLateral);
		Listeners.remove(window, 'LoadedAutoHidePuzzleBar', osbMoveLateral);
		Listeners.remove(window, 'UnloadedAutoHidePuzzleBar', osbMoveLateral);
		Listeners.remove(window, 'endToggleSidebar', osbMoveLateral);
		Listeners.remove(window, 'sidebarAbove', osbMoveLateral);
		Listeners.remove(window, 'sidebarDocked', osbMoveLateral);
		Listeners.remove(window, 'ToggledPuzzleBar', osbMoveLateral);
	}
};

this.osbListener = {
	onEnabled: function(addon) {
		if(addon.id == 'osb@quicksaver') { osbFixer(true); }
	},
	onDisabled: function(addon) {
		if(addon.id == 'osb@quicksaver') { osbFixer(false); }
	}
};

Modules.LOADMODULE = function() {
	AddonManager.addAddonListener(osbListener);
	AddonManager.getAddonByID('osb@quicksaver', function(addon) {
		if(addon && addon.isActive) { osbFixer(true); }
	});
};

Modules.UNLOADMODULE = function() {
	AddonManager.removeAddonListener(osbListener);
	osbFixer(false);
};
