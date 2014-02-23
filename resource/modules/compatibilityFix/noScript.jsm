moduleAid.VERSION = '1.0.0';

// https://github.com/Quicksaver/The-Puzzle-Piece/issues/11

this.noScriptCommanded = false;

this.shouldSetNoScript = function(e) {
	if(e.target.id == 'noscript-tbb-popup') {
		setNoScript();
	}
};

this.noScriptCommand = function(e) {
	if(e.target.classList.contains('noscript-cmd')) {
		noScriptCommanded = true;
	}
};

this.setNoScript = function() {
	listenerAid.add($('noscript-tbb-popup'), 'popuphidden', noScriptCloseMenu);
	listenerAid.add(window, 'command', noScriptCommand);
};

this.unsetNoScript = function() {
	listenerAid.remove($('noscript-tbb-popup'), 'popuphidden', noScriptCloseMenu);
	listenerAid.remove(window, 'command', noScriptCommand);
};

this.noScriptCloseMenu = function() {
	if(noScriptCommanded && prefAid.autoHide && typeof(onMouseOut) != 'undefined') {
		onMouseOut();
	}
	
	noScriptCommanded = false;
	listenerAid.remove(window, 'command', noScriptCommand);
};

moduleAid.LOADMODULE = function() {
	listenerAid.add(window, 'beforecustomization', unsetNoScript);
	listenerAid.add(window, 'aftercustomization', setNoScript);
	listenerAid.add(window, 'popupshown', shouldSetNoScript);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(window, 'beforecustomization', unsetNoScript);
	listenerAid.remove(window, 'aftercustomization', setNoScript);
	listenerAid.remove(window, 'popupshown', shouldSetNoScript);
	
	unsetNoScript();
};
