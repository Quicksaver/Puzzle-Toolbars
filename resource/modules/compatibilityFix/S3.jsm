Modules.VERSION = '1.0.2';

this.watchS3Bar = function() {
	if(Prefs.corner_bar && typeof(cornerBar) != 'undefined' && cornerBar && !cornerBar.collapsed && !customizing) {
		cornerMove();
	}
};

Modules.LOADMODULE = function() {
	Watchers.addAttributeWatcher($('s3downbar_toolbar_panel'), 'collapsed', watchS3Bar);
};

Modules.UNLOADMODULE = function() {
	Watchers.removeAttributeWatcher($('s3downbar_toolbar_panel'), 'collapsed', watchS3Bar);
};
