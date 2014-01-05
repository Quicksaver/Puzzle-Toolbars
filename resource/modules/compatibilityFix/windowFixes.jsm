moduleAid.VERSION = '1.0.1';

moduleAid.LOADMODULE = function() {
	if(Services.navigator.oscpu == 'Windows NT 5.1' && !Australis) {
		moduleAid.load('compatibilityFix/winxp');
	}
	
	if(Australis) {
		AddonManager.getAddonByID("ClassicThemeRestorer@ArisT2Noia4dev", function(addon) {
			moduleAid.loadIf('compatibilityFix/ctr', (addon && addon.isActive));
		});
	}
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/winxp');
	moduleAid.unload('compatibilityFix/ctr');
};
