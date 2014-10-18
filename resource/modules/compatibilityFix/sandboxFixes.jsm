moduleAid.VERSION = '1.0.3';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("ClassicThemeRestorer@ArisT2Noia4dev", function(addon) {
		moduleAid.loadIf('compatibilityFix/ctr', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("Stratiform@SoapySpew", function(addon) {
		moduleAid.loadIf('compatibilityFix/stratiform', (addon && addon.isActive));
	});
	
	moduleAid.load('compatibilityFix/buttons');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/ctr');
	moduleAid.unload('compatibilityFix/stratiform');
	moduleAid.unload('compatibilityFix/buttons');
};
