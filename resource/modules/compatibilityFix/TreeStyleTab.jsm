moduleAid.VERSION = '1.0.0';

this.listenForTreeStyleTab = function() {
	if(prefAid.placement == 'corner' && !addonBar.collapsed && typeof(moveAddonBar) != 'undefined') {
		moveAddonBar();
	}
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', listenForTreeStyleTab);
};
