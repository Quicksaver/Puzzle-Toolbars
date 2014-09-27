moduleAid.VERSION = '1.0.4';

this.addonBarKey = {
	id: objName+'-key',
	command: objName+':ToggleAddonBar',
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
	prefAid.listen('addonBarKeycode', setKeys);
	prefAid.listen('addonBarAccel', setKeys);
	prefAid.listen('addonBarShift', setKeys);
	prefAid.listen('addonBarAlt', setKeys);
	
	setKeys();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('addonBarKeycode', setKeys);
	prefAid.unlisten('addonBarAccel', setKeys);
	prefAid.unlisten('addonBarShift', setKeys);
	prefAid.unlisten('addonBarAlt', setKeys);
	
	keysetAid.unregister(addonBarKey);
};
