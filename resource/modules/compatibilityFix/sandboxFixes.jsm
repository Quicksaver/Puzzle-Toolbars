moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	if(Australis) {
		AddonManager.getAddonByID("ClassicThemeRestorer@ArisT2Noia4dev", function(addon) {
			moduleAid.loadIf('compatibilityFix/ctr', (addon && addon.isActive));
		});
	}
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/ctr');
};
