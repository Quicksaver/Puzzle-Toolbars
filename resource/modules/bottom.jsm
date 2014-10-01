moduleAid.VERSION = '1.0.0';

this.__defineGetter__('bottomBar', function() { return $(objName+'-bottom-bar'); });
this.__defineGetter__('bottomPP', function() { return $(objName+'-bottom-PP'); });

this.bottomKey = {
	id: objName+'-bottom-key',
	command: objName+':ToggleBottomBar',
	get keycode () { return prefAid.bottom_keycode; },
	get accel () { return prefAid.bottom_accel; },
	get shift () { return prefAid.bottom_shift; },
	get alt () { return prefAid.bottom_alt; }
};

this.setBottomKey = function() {
	if(bottomKey.keycode != 'none') { keysetAid.register(bottomKey); }
	else { keysetAid.unregister(bottomKey); }
};

this.bottomTogglePP = function() {
	bottomPP.hidden = !prefAid.bottom_pp;
	toggleAttribute(bottomBar, 'hidePP', !prefAid.bottom_pp);
	
	// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
	bottomMove();
};

this.bottomRight = function() {
	toggleAttribute(bottomBar, 'movetoright', prefAid.bottom_right);
};

this.bottomMove = function() {
	// Let's account for the transparent bottom border as well if it exists
	var bottomBarStyle = getComputedStyle(bottomBar);
	var bottom = -parseInt(bottomBarStyle.getPropertyValue('border-bottom-width'));
	
	var left = 2;
	var right = 2;
	
	var OSoffset = (WINNT) ? -2 : 0;
	var ppOffset = bottomPP.lastChild.clientHeight -bottomPP.clientHeight;
	
	var shrunkOffset = 0;
	if(bottomBar.clientHeight > 0) {
		var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 28; // when shrunk
		shrunkOffset += Math.floor((PPsize -bottomBar.clientHeight) /2);
	}
	
	styleAid.unload('bottomMove_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([movetoright]) { left: '+(left)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[movetoright] { right: '+(right)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP {\n';
	sscode += '		bottom: '+(bottom +ppOffset +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[active]:not(:hover):not([hover]) {\n';
	sscode += '		bottom: '+(bottom +ppOffset +OSoffset +shrunkOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	@media not all and (-moz-windows-classic) {\n';
	sscode += '		@media (-moz-windows-default-theme) {\n';
	sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-bottom-PP[active]:not(:hover):not([hover]) {\n';
	sscode += '				bottom: '+(bottom +ppOffset +OSoffset +shrunkOffset +1)+'px;\n';
	sscode += '			}\n';
	sscode += '		}\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([active]):not(:hover):not([hover]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[autohide][active]:not(:hover):not([hover]) {\n';
	sscode += '		bottom: '+(bottom +ppOffset +OSoffset -21)+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('bottomMove_'+_UUID, sscode, true);
};

this.bottomOnLoad = function() {
	listenerAid.add(window, 'PuzzleBarsMoved', bottomMove);
	
	bottomTogglePP(); // implies bottomMove()
	bottomRight();
	
	initBar(bottomBar, bottomPP);
};

this.bottomOnUnload = function() {
	deinitBar(bottomBar, bottomPP);
	
	listenerAid.remove(window, 'PuzzleBarsMoved', bottomMove);
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('bottom_pp', bottomTogglePP);
	prefAid.listen('bottom_right', bottomRight);
	prefAid.listen('bottom_keycode', setBottomKey);
	prefAid.listen('bottom_accel', setBottomKey);
	prefAid.listen('bottom_shift', setBottomKey);
	prefAid.listen('bottom_alt', setBottomKey);
	
	setBottomKey();
	
	overlayAid.overlayWindow(window, 'bottom', null, bottomOnLoad, bottomOnUnload);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'bottom');
	styleAid.unload('bottomMove_'+_UUID);
	
	prefAid.unlisten('bottom_pp', bottomTogglePP);
	prefAid.unlisten('bottom_right', bottomRight);
	prefAid.unlisten('bottom_keycode', setBottomKey);
	prefAid.unlisten('bottom_accel', setBottomKey);
	prefAid.unlisten('bottom_shift', setBottomKey);
	prefAid.unlisten('bottom_alt', setBottomKey);
	
	if(UNLOADED || !prefAid.bottom_bar) {
		keysetAid.unregister(bottomKey);
	}
};
