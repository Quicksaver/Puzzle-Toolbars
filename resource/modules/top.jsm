moduleAid.VERSION = '1.0.1';

this.__defineGetter__('topBar', function() { return $(objName+'-top-bar'); });
this.__defineGetter__('topPP', function() { return $(objName+'-top-PP'); });

this.topKey = {
	id: objName+'-top-key',
	command: objName+':ToggleTopBar',
	get keycode () { return prefAid.top_keycode; },
	get accel () { return prefAid.top_accel; },
	get shift () { return prefAid.top_shift; },
	get alt () { return prefAid.top_alt; }
};

this.setTopKey = function() {
	if(topKey.keycode != 'none') { keysetAid.register(topKey); }
	else { keysetAid.unregister(topKey); }
};

this.topTogglePP = function() {
	topPP.hidden = !prefAid.top_pp;
	toggleAttribute(topBar, 'hidePP', !prefAid.top_pp);
	
	// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
	topMove();
};

this.topPlacement = function() {
	toggleAttribute(topBar, 'movetoright', prefAid.top_placement == 'right');
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
	
	styleAid.unload('topMove_'+_UUID);
	
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
	
	styleAid.load('topMove_'+_UUID, sscode, true);
};

this.topOnLoad = function() {
	listenerAid.add(window, 'PuzzleBarsMoved', topMove);
	
	topTogglePP(); // implies topMove()
	topPlacement();
	
	// make sure it gets the brighttext attribute whenever needed, as this toolbar doesn't add attribute watchers like the others
	window.ToolbarIconColor.inferFromText();
	
	initBar(topBar, topPP);
};

this.topOnUnload = function() {
	deinitBar(topBar, topPP);
	
	listenerAid.remove(window, 'PuzzleBarsMoved', topMove);
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('top_pp', topTogglePP);
	prefAid.listen('top_placement', topPlacement);
	prefAid.listen('top_keycode', setTopKey);
	prefAid.listen('top_accel', setTopKey);
	prefAid.listen('top_shift', setTopKey);
	prefAid.listen('top_alt', setTopKey);
	
	setTopKey();
	
	overlayAid.overlayWindow(window, 'top', null, topOnLoad, topOnUnload);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'top');
	styleAid.unload('topMove_'+_UUID);
	
	prefAid.unlisten('top_pp', topTogglePP);
	prefAid.unlisten('top_placement', topPlacement);
	prefAid.unlisten('top_keycode', setTopKey);
	prefAid.unlisten('top_accel', setTopKey);
	prefAid.unlisten('top_shift', setTopKey);
	prefAid.unlisten('top_alt', setTopKey);
	
	if(UNLOADED || !prefAid.top_bar) {
		keysetAid.unregister(topKey);
	}
};
