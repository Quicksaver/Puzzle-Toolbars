moduleAid.VERSION = '1.0.4';

this.toggleAutoHide = function() {
	moduleAid.loadIf('autoHide', prefAid.autoHide);
};

this.toggleInURLBar = function() {
	moduleAid.loadIf('inURLBar', prefAid.inURLBar);
};

moduleAid.LOADMODULE = function() {
	moduleAid.load('compatibilityFix/windowFixes');
	moduleAid.load('initAddonBar');
	moduleAid.load('placePP');
	
	prefAid.listen('autoHide', toggleAutoHide);
	prefAid.listen('inURLBar', toggleInURLBar);
	
	toggleInURLBar();
	toggleAutoHide();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('autoHide', toggleAutoHide);
	prefAid.unlisten('inURLBar', toggleInURLBar);
	
	moduleAid.unload('inURLBar');
	moduleAid.unload('autoHide');
	moduleAid.unload('placePP');
	moduleAid.unload('initAddonBar');
	moduleAid.unload('compatibilityFix/windowFixes');
};
