/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.5

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("ClassicThemeRestorer@ArisT2Noia4dev", function(addon) {
		Modules.loadIf('compatibilityFix/ctr', (addon && addon.isActive));
	});

	AddonManager.getAddonByID("Stratiform@SoapySpew", function(addon) {
		Modules.loadIf('compatibilityFix/stratiform', (addon && addon.isActive));
	});

	AddonManager.getAddonByID("{dc572301-7619-498c-a57d-39143191b318}", function(addon) {
		Modules.loadIf('compatibilityFix/TMP', (addon && addon.isActive));
	});

	Modules.load('compatibilityFix/buttons');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/ctr');
	Modules.unload('compatibilityFix/stratiform');
	Modules.unload('compatibilityFix/TMP');
	Modules.unload('compatibilityFix/buttons');
};
