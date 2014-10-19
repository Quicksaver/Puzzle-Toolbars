Modules.VERSION = '1.0.3';

this.__defineGetter__('topBar', function() { return $(objName+'-top-bar'); });
this.__defineGetter__('topPP', function() { return $(objName+'-top-PP'); });

this.topKey = {
	id: objName+'-top-key',
	command: objName+':ToggleTopBar',
	get keycode () { return Prefs.top_keycode; },
	get accel () { return Prefs.top_accel; },
	get shift () { return Prefs.top_shift; },
	get alt () { return Prefs.top_alt; }
};

this.setTopKey = function() {
	if(topKey.keycode != 'none') { Keysets.register(topKey); }
	else { Keysets.unregister(topKey); }
};

this.topTogglePP = function() {
	topPP.hidden = !Prefs.top_pp;
	toggleAttribute(topBar, 'hidePP', !Prefs.top_pp);
	
	// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
	topMove();
};

this.topPlacement = function() {
	toggleAttribute(topBar, 'movetoright', Prefs.top_placement == 'right');
};

this.topStyle = {};
this.topMove = function() {
	// just making sure
	if(!topBar) { return; }
	
	var topBarStyle = getComputedStyle(topBar);
	var topBarRect = topBar.getBoundingClientRect();
	topStyle = {
		// Let's account for the transparent top border as well if it exists
		top: topBarRect.top -parseInt(topBarStyle.getPropertyValue('border-top-width')),
		left: topBarRect.left +2,
		right: document.documentElement.clientWidth -topBarRect.right +2
	};
	
	var OSoffset = (WINNT) ? -2 : 0;
	var ppOffset = topPP.lastChild.clientHeight -topPP.clientHeight;
	
	var shrunkOffset = 0;
	var shrunkOffsetHover = 0;
	if(topBar.clientHeight > 0) {
		var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 25; // when shrunk
		shrunkOffset -= Math.floor((PPsize +ppOffset -topBar.clientHeight) /2);
		shrunkOffsetHover -= Math.min(Math.floor((PPsize -ppOffset -topBar.clientHeight) /2), 0);
	}
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP:not([movetoright]) { left: '+(topStyle.left)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP[movetoright] { right: '+(topStyle.right)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP:not([active]) {\n';
	sscode += '		top: '+(topStyle.top +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP[active] {\n';
	sscode += '		top: '+(topStyle.top +OSoffset +shrunkOffsetHover)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP[active]:not(:hover) {\n';
	sscode += '		top: '+(topStyle.top +OSoffset +shrunkOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	@media not all and (-moz-windows-classic) {\n';
	sscode += '		@media (-moz-windows-default-theme) {\n';
	sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-top-PP[active]:not(:hover) {\n';
	sscode += '				top: '+(topStyle.top +OSoffset +shrunkOffset +1)+'px;\n';
	sscode += '			}\n';
	sscode += '		}\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP:not([active]):not(:hover) {\n';
	sscode += '		top: '+(topStyle.top +OSoffset -21)+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	Styles.load('topMove_'+_UUID, sscode, true);
};

this.topOnLoad = function() {
	Listeners.add(window, 'PuzzleBarsMoved', topMove);
	
	topTogglePP(); // implies topMove()
	topPlacement();
	
	// make sure it gets the brighttext attribute whenever needed, as this toolbar doesn't add attribute watchers like the others
	window.ToolbarIconColor.inferFromText();
	
	initBar(topBar, topPP);
};

this.topOnUnload = function() {
	deinitBar(topBar, topPP);
	
	Listeners.remove(window, 'PuzzleBarsMoved', topMove);
};

Modules.LOADMODULE = function() {
	Prefs.listen('top_pp', topTogglePP);
	Prefs.listen('top_placement', topPlacement);
	Prefs.listen('top_keycode', setTopKey);
	Prefs.listen('top_accel', setTopKey);
	Prefs.listen('top_shift', setTopKey);
	Prefs.listen('top_alt', setTopKey);
	
	setTopKey();
	
	Overlays.overlayWindow(window, 'top', null, topOnLoad, topOnUnload);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'top');
	Styles.unload('topMove_'+_UUID);
	
	Prefs.unlisten('top_pp', topTogglePP);
	Prefs.unlisten('top_placement', topPlacement);
	Prefs.unlisten('top_keycode', setTopKey);
	Prefs.unlisten('top_accel', setTopKey);
	Prefs.unlisten('top_shift', setTopKey);
	Prefs.unlisten('top_alt', setTopKey);
	
	if(UNLOADED || !Prefs.top_bar) {
		Keysets.unregister(topKey);
	}
};
