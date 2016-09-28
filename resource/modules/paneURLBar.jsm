/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.0

this.urlbarCheckboxes = function() {
	Timers.init('urlbarCheckboxes', function() {
		var pp = $(objName+'-urlbar-ppCheckbox');
		var autohide = $(objName+'-urlbar-autohideCheckbox');
		var whenfocused = $(objName+'-urlbar-whenfocusedCheckbox');

		if(autohide.checked && !pp.checked && !whenfocused.checked) {
			autohide.checked = false;
			autohide.doCommand(); // trigger dependencies
		}
	});
};
