moduleAid.VERSION = '1.0.0';

this.changeStratiformColor = function() {
	styleAid.unload('stratiformFix');
	
	if(prefAid['selectedtab-bg']) {
		var color = JSON.parse(prefAid['selectedtab-bg']);
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '.addon-bar[placement="corner"] { background-color: hsla('+color.H+', '+color.S+'%, '+color.L+'%, 1) !important; }';
		
		styleAid.load('stratiformFix', sscode, true);
	}
};

moduleAid.LOADMODULE = function() {
	// it has a '-' character...
	var stratiformPrefs = {};
	stratiformPrefs['selectedtab-bg'] = '';
	prefAid.setDefaults(stratiformPrefs, 'stratiform');
	
	prefAid.listen('selectedtab-bg', changeStratiformColor);
	
	changeStratiformColor();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('selectedtab-bg', changeStratiformColor);
	
	styleAid.unload('stratiformFix');
};
