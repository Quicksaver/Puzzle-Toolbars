Modules.VERSION = '1.0.3';

this.watchS3Bar = function() {
	if(Prefs.corner_bar && typeof(corner) != 'undefined' && corner.bar && !corner.bar.collapsed && !customizing) {
		corner.move();
	}
};

Modules.LOADMODULE = function() {
	Watchers.addAttributeWatcher($('s3downbar_toolbar_panel'), 'collapsed', watchS3Bar);
};

Modules.UNLOADMODULE = function() {
	Watchers.removeAttributeWatcher($('s3downbar_toolbar_panel'), 'collapsed', watchS3Bar);
};
