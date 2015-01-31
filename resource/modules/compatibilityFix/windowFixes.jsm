Modules.VERSION = '1.0.17';

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
};
