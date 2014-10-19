moduleAid.VERSION = '1.0.4';

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("ClassicThemeRestorer@ArisT2Noia4dev", function(addon) {
		moduleAid.loadIf('compatibilityFix/ctr', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("Stratiform@SoapySpew", function(addon) {
		moduleAid.loadIf('compatibilityFix/stratiform', (addon && addon.isActive));
	});
	
	AddonManager.getAddonByID("{dc572301-7619-498c-a57d-39143191b318}", function(addon) {
		moduleAid.loadIf('compatibilityFix/TMP', (addon && addon.isActive));
	});
	
	moduleAid.load('compatibilityFix/buttons');
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/ctr');
	moduleAid.unload('compatibilityFix/stratiform');
	moduleAid.unload('compatibilityFix/TMP');
	moduleAid.unload('compatibilityFix/buttons');
};
