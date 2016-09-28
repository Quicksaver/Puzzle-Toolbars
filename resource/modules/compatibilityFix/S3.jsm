/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.3

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
