// VERSION 1.0.4

this.changeStratiformColor = function() {
	Styles.unload('stratiformFix');

	if(Prefs['selectedtab-bg']) {
		var color = JSON.parse(Prefs['selectedtab-bg']);

		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			#'+objName+'-corner-container { background-color: hsla('+color.H+', '+color.S+'%, '+color.L+'%, 1) !important; }';

		Styles.load('stratiformFix', sscode, true);
	}
};

Modules.LOADMODULE = function() {
	// it has a '-' character...
	var stratiformPrefs = {};
	stratiformPrefs['selectedtab-bg'] = '';
	Prefs.setDefaults(stratiformPrefs, 'stratiform');

	Prefs.listen('selectedtab-bg', changeStratiformColor);

	changeStratiformColor();
};

Modules.UNLOADMODULE = function() {
	Prefs.unlisten('selectedtab-bg', changeStratiformColor);

	Styles.unload('stratiformFix');
};
