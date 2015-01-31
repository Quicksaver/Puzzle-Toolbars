Modules.VERSION = '1.1.0';

this.listenForTreeStyleTab = function() {
	if(Prefs.corner_bar && typeof(cornerBar) != 'undefined' && cornerBar && !cornerBar.collapsed && !customizing) {
		cornerMove();
	}
};

this.TSTtoggleLateral = function(e) {
	if(typeof(lateralBar) != 'undefined' && e.target == lateralBar) {
		if(e.type == 'LoadedPuzzleBar') {
			aSync(TSTresize);
		} else {
			TSTresize();
		}
	}
};

this.TSTresize = function() {
	gBrowser.treeStyleTab.onResize({ originalTarget: window });
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	Listeners.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
	Listeners.add(window, 'ToggledPuzzleBar', TSTtoggleLateral);
	Listeners.add(window, 'LoadedAutoHidePuzzleBar', TSTtoggleLateral);
	Listeners.add(window, 'UnloadedAutoHidePuzzleBar', TSTtoggleLateral);
	Listeners.add(window, 'LoadedPuzzleBar', TSTtoggleLateral);
	Listeners.add(window, 'UnloadedPuzzleBar', TSTtoggleLateral);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	Listeners.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
	Listeners.remove(window, 'ToggledPuzzleBar', TSTtoggleLateral);
	Listeners.remove(window, 'LoadedAutoHidePuzzleBar', TSTtoggleLateral);
	Listeners.remove(window, 'UnloadedAutoHidePuzzleBar', TSTtoggleLateral);
	Listeners.remove(window, 'LoadedPuzzleBar', TSTtoggleLateral);
	Listeners.remove(window, 'UnloadedPuzzleBar', TSTtoggleLateral);
};
