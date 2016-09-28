/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.1.1

this.TMPtoggledBottom = function() {
	if(Prefs.tabBarPosition == 1) {
		Overlays.overlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
	} else {
		Overlays.removeOverlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
	}
};

Modules.LOADMODULE = function() {
	Prefs.setDefaults({ tabBarPosition: 0 }, 'tabmix');
	Prefs.listen('tabBarPosition', TMPtoggledBottom);

	TMPtoggledBottom();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('tabBarPosition', TMPtoggledBottom);
	Overlays.removeOverlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
};
