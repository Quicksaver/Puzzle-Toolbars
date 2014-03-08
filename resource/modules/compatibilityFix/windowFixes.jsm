moduleAid.VERSION = '1.0.5';

moduleAid.LOADMODULE = function() {
	if(Services.navigator.oscpu == 'Windows NT 5.1' && !Australis) {
		moduleAid.load('compatibilityFix/winxp');
	}
	
	AddonManager.getAddonByID("{73a6fe31-595d-460b-a920-fcc0f8843232}", function(addon) {
		moduleAid.loadIf('compatibilityFix/noScript', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("s3download@statusbar", function(addon) {
		moduleAid.loadIf('compatibilityFix/S3', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("tiletabs@DW-dev", function(addon) {
		moduleAid.loadIf('compatibilityFix/TileTabs', (addon && addon.isActive));
	});
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/winxp');
	moduleAid.unload('compatibilityFix/noScript');
	moduleAid.unload('compatibilityFix/S3');
	moduleAid.unload('compatibilityFix/TileTabs');
};
