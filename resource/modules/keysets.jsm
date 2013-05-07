moduleAid.VERSION = '1.0.0';

this.addonBarKey = {
	id: objName+'-key',
	command: 'Browser:ToggleAddonBar',
	get keycode () { return prefAid.addonBarKeycode; },
	get accel () { return prefAid.addonBarAccel; },
	get shift () { return prefAid.addonBarShift; },
	get alt () { return prefAid.addonBarAlt; }
};

this.setKeys = function() {
	if(addonBarKey.keycode != 'none') { keysetAid.register(addonBarKey); }
	else { keysetAid.unregister(addonBarKey); }
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayURI('chrome://browser/content/browser.xul', 'keyset', null, function() { setKeys(); });
	
	prefAid.listen('addonBarKeycode', setKeys);
	prefAid.listen('addonBarAccel', setKeys);
	prefAid.listen('addonBarShift', setKeys);
	prefAid.listen('addonBarAlt', setKeys);
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('addonBarKeycode', setKeys);
	prefAid.unlisten('addonBarAccel', setKeys);
	prefAid.unlisten('addonBarShift', setKeys);
	prefAid.unlisten('addonBarAlt', setKeys);
	
	keysetAid.unregister(addonBarKey);
	overlayAid.removeOverlayURI('chrome://browser/content/browser.xul', 'keyset');
};
