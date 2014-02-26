moduleAid.VERSION = '1.0.0';

this.watchS3Bar = function() {
	if(prefAid.placement == 'corner' && !addonBar.collapsed && typeof(moveAddonBar) != 'undefined') {
		moveAddonBar();
	}
};

moduleAid.LOADMODULE = function() {
	objectWatcher.addAttributeWatcher($('s3downbar_toolbar_panel'), 'collapsed', watchS3Bar);
};

moduleAid.UNLOADMODULE = function() {
	objectWatcher.removeAttributeWatcher($('s3downbar_toolbar_panel'), 'collapsed', watchS3Bar);
};
