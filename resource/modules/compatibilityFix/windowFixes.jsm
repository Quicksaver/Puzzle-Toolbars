moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	if(Services.navigator.oscpu == 'Windows NT 5.1') {
		moduleAid.load('compatibilityFix/winxp');
	}
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/winxp');
};
