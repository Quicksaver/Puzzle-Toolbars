moduleAid.VERSION = '1.0.10';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("s3download@statusbar", function(addon) {
		moduleAid.loadIf('compatibilityFix/S3', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("tiletabs@DW-dev", function(addon) {
		moduleAid.loadIf('compatibilityFix/TileTabs', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID('treestyletab@piro.sakura.ne.jp', function(addon) {
		moduleAid.loadIf('compatibilityFix/TreeStyleTab', (addon && addon.isActive));
	});
	
	moduleAid.load('compatibilityFix/UIEnhancer');
	
	toggleAttribute(document.documentElement, objName+'-FF34', Services.vc.compare(Services.appinfo.version, "34.0a1") >= 0);
};

moduleAid.UNLOADMODULE = function() {
	removeAttribute(document.documentElement, objName+'-FF34');
	
	moduleAid.unload('compatibilityFix/S3');
	moduleAid.unload('compatibilityFix/TileTabs');
	moduleAid.unload('compatibilityFix/TreeStyleTab');
	moduleAid.unload('compatibilityFix/UIEnhancer');
};
