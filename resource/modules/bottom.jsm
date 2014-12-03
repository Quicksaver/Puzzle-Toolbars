Modules.VERSION = '1.0.9';

this.__defineGetter__('bottomBox', function() { return $('browser-bottombox'); });
this.__defineGetter__('bottomBar', function() { return $(objName+'-bottom-bar'); });
this.__defineGetter__('bottomPP', function() { return $(objName+'-bottom-PP'); });

this.bottomKey = {
	id: objName+'-bottom-key',
	command: objName+':ToggleBottomBar',
	get keycode () { return Prefs.bottom_keycode; },
	get accel () { return Prefs.bottom_accel; },
	get shift () { return Prefs.bottom_shift; },
	get alt () { return Prefs.bottom_alt; }
};

this.setBottomKey = function() {
	if(bottomKey.keycode != 'none') { Keysets.register(bottomKey); }
	else { Keysets.unregister(bottomKey); }
};

this.bottomTogglePP = function() {
	bottomPP.hidden = !Prefs.bottom_pp;
	toggleAttribute(bottomBar, 'hidePP', !Prefs.bottom_pp);
	
	// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
	bottomMove();
};

this.bottomPlacement = function() {
	toggleAttribute(bottomBar, 'movetoright', Prefs.bottom_placement == 'right');
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
	var shrunkOffsetHover = 0;
	if(bottomBar.clientHeight > 0) {
		var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 25; // when shrunk
		shrunkOffset -= Math.floor((PPsize -bottomBar.clientHeight) /2);
		shrunkOffsetHover -= Math.min(Math.floor((PPsize -ppOffset -bottomBar.clientHeight) /2), 0);
	}
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([movetoright]) { left: '+(left)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[movetoright] { right: '+(right)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([active]) {\n';
	sscode += '		bottom: '+(bottom +ppOffset +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[active] {\n';
	sscode += '		bottom: '+(bottom +ppOffset +OSoffset +shrunkOffsetHover)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[active]:not(:hover) {\n';
	sscode += '		bottom: '+(bottom +ppOffset +OSoffset +shrunkOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	@media not all and (-moz-windows-classic) {\n';
	sscode += '		@media (-moz-windows-default-theme) {\n';
	sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-bottom-PP[active]:not(:hover) {\n';
	sscode += '				bottom: '+(bottom +ppOffset +OSoffset +shrunkOffset +1)+'px;\n';
	sscode += '			}\n';
	sscode += '		}\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([active]):not(:hover) {\n';
	sscode += '		bottom: '+(bottom +ppOffset +OSoffset -21)+'px;\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[autohide][active]:not(:hover):not([hover]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-bar[autohide]:not(:hover):not([hover]) {\n';
	sscode += '		margin-bottom: '+(1 -bottomBar.clientHeight)+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	Styles.load('bottomMove_'+_UUID, sscode, true);
};

this.bottomBrightText = function() {
	toggleAttribute(bottomBar, 'brighttext', trueAttribute(gNavBar, 'brighttext'));
};

this.bottomAutoHide = function() {
	if(onFullScreen.hideBars) {
		initAutoHide(bottomBar, [bottomBar, bottomPP], bottomBar, 'margin');
		
		// this would cause the bottom toolbar to appear invisible
		removeAttribute(bottomBox, 'layer');
	} else {
		setAttribute(bottomBox, 'layer', 'true');
		deinitAutoHide(bottomBar);
	}
};

this.bottomOnLoad = function() {
	Listeners.add(window, 'PuzzleBarsMoved', bottomMove);
	Watchers.addAttributeWatcher(gNavBar, 'brighttext', bottomBrightText);
	
	bottomTogglePP(); // implies bottomMove()
	bottomPlacement();
	bottomBrightText();
	bottomAutoHide();
	
	initBar(bottomBar, bottomPP);
};

this.bottomOnUnload = function() {
	setAttribute(bottomBox, 'layer', 'true');
	
	deinitAutoHide(bottomBar);
	deinitBar(bottomBar, bottomPP);
	
	Watchers.removeAttributeWatcher(gNavBar, 'brighttext', bottomBrightText);
	Listeners.remove(window, 'PuzzleBarsMoved', bottomMove);
};

Modules.LOADMODULE = function() {
	Prefs.listen('bottom_pp', bottomTogglePP);
	Prefs.listen('bottom_placement', bottomPlacement);
	Prefs.listen('bottom_keycode', setBottomKey);
	Prefs.listen('bottom_accel', setBottomKey);
	Prefs.listen('bottom_shift', setBottomKey);
	Prefs.listen('bottom_alt', setBottomKey);
	Prefs.listen('fullscreen.autohide', bottomAutoHide);
	onFullScreen.add(bottomAutoHide);
	
	setBottomKey();
	
	Overlays.overlayWindow(window, 'bottom', null, bottomOnLoad, bottomOnUnload);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'bottom');
	Styles.unload('bottomMove_'+_UUID);
	
	onFullScreen.remove(bottomAutoHide);
	Prefs.unlisten('fullscreen.autohide', bottomAutoHide);
	Prefs.unlisten('bottom_pp', bottomTogglePP);
	Prefs.unlisten('bottom_placement', bottomPlacement);
	Prefs.unlisten('bottom_keycode', setBottomKey);
	Prefs.unlisten('bottom_accel', setBottomKey);
	Prefs.unlisten('bottom_shift', setBottomKey);
	Prefs.unlisten('bottom_alt', setBottomKey);
	
	if(UNLOADED || !Prefs.bottom_bar) {
		Keysets.unregister(bottomKey);
	}
};
