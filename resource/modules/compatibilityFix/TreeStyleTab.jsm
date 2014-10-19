Modules.VERSION = '1.0.3';

this.listenForTreeStyleTab = function() {
	if(Prefs.corner_bar && typeof(cornerBar) != 'undefined' && cornerBar && !cornerBar.collapsed && !customizing) {
		cornerMove();
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	Listeners.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	Listeners.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
};
