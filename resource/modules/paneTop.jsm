/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.0

this.paneTop = {
	observe: function(aSubject, aTopic, aData) {
		// Only case is Prefs.tFOB
		this.toggleSlimChromeCheckbox();
	},

	toggleSlimChromeCheckbox: function() {
		$('paneTop-behavior').hidden = !Prefs.tFOB;
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('tFOB', paneTop);
	paneTop.toggleSlimChromeCheckbox();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('tFOB', paneTop);
};
