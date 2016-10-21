/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.18

Modules.LOADMODULE = function() {
	AddonManager.getAddonByID("s3download@statusbar", function(addon) {
		Modules.loadIf('compatibilityFix/S3', (addon && addon.isActive));
	});

	AddonManager.getAddonByID("tiletabs@DW-dev", function(addon) {
		Modules.loadIf('compatibilityFix/TileTabs', (addon && addon.isActive));
	});

	AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
		Modules.loadIf('compatibilityFix/TreeStyleTab', (addon && addon.isActive));
	});

	Modules.load('compatibilityFix/downloadsIndicator');
	Modules.load('compatibilityFix/bookmarkedItem');
	Modules.load('compatibilityFix/bookmarksToolbar');
	Modules.load('compatibilityFix/UIEnhancer');
	Modules.load('compatibilityFix/theFoxOnlyBetter');
	Modules.load('compatibilityFix/OmniSidebar');
	Modules.load('compatibilityFix/TabGroups');
};

Modules.UNLOADMODULE = function() {
	Modules.unload('compatibilityFix/S3');
	Modules.unload('compatibilityFix/TileTabs');
	Modules.unload('compatibilityFix/TreeStyleTab');
	Modules.unload('compatibilityFix/downloadsIndicator');
	Modules.unload('compatibilityFix/bookmarkedItem');
	Modules.unload('compatibilityFix/bookmarksToolbar');
	Modules.unload('compatibilityFix/UIEnhancer');
	Modules.unload('compatibilityFix/theFoxOnlyBetter');
	Modules.unload('compatibilityFix/OmniSidebar');
	Modules.unload('compatibilityFix/TabGroups');
};
