moduleAid.VERSION = '1.0.2';

this.listenForTreeStyleTab = function() {
	if(prefAid.corner_bar && typeof(cornerBar) != 'undefined' && cornerBar && !cornerBar.collapsed && !customizing) {
		cornerMove();
	}
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	listenerAid.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
	listenerAid.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', listenForTreeStyleTab);
};
