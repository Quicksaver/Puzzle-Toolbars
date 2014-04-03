moduleAid.VERSION = '1.0.1';

this.listenForTreeStyleTab = function() {
	if(prefAid.placement == 'corner' && !addonBar.collapsed && typeof(moveAddonBar) != 'undefined') {
		moveAddonBar();
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
