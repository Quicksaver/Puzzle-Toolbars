moduleAid.VERSION = '1.0.3';

this.toggleAutoHide = function() {
	moduleAid.loadIf('autoHide', prefAid.autoHide);
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	moduleAid.load('initAddonBar');
	moduleAid.load('placePP');
	
	prefAid.listen('autoHide', toggleAutoHide);
	
	toggleAutoHide();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('autoHide', toggleAutoHide);
	
	moduleAid.unload('autoHide');
	moduleAid.unload('placePP');
	moduleAid.unload('initAddonBar');
	moduleAid.unload('compatibilityFix/windowFixes');
};
