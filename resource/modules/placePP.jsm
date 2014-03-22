moduleAid.VERSION = '1.1.7';

this.__defineGetter__('leftPP', function() { return $(objName+'-left-PP'); });
this.__defineGetter__('rightPP', function() { return $(objName+'-right-PP'); });
this.__defineGetter__('urlbarPP', function() { return $(objName+'-urlbar-PP'); });
this.__defineGetter__('activePP', function() { return (prefAid.placement == 'urlbar') ? urlbarPP : (prefAid.movetoRight) ? rightPP : leftPP; });

this.commandPP = function(e) {
	if(e.button != 0) { return; }
	toggleAddonBar();
	dispatch(activePP, { type: 'toggledAddonBarThroughButton', cancelable: false });
};

this.movePPs = function() {
	toggleAttribute(activePP, 'clipped', moveBarStyle.bottom == 1);
	
	var pieceOffset = (activePP) ? activePP.firstChild.clientHeight -activePP.clientHeight : 0; // I have no idea why it adds a space in the bottom
	var OSoffset = (Services.appinfo.OS == 'WINNT') ? -2 : 0;
	
	// for when the add-on bar is opened on the bottom
	var shrunkOffset = 0;
	if(moveBarStyle.clientHeight > 0) {
		var PPsize = (Services.appinfo.OS == 'WINNT') ? 22 : (Services.appinfo.OS == 'Darwin') ? 24 : 28; // when shrunk
		shrunkOffset += Math.floor((PPsize -moveBarStyle.clientHeight) /2);
	}
	
	styleAid.unload('positionPPs_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-left-PP { left: '+(moveBarStyle.left -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-right-PP { right: '+(moveBarStyle.right -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece {\n';
	sscode += '		bottom: '+(moveBarStyle.bottom +pieceOffset +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece[bottomPlacement][active]:not(:hover):not([hover]) {\n';
	sscode += '		bottom: '+(moveBarStyle.bottom +pieceOffset +OSoffset +shrunkOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	@media not all and (-moz-windows-classic) {\n';
	sscode += '		@media (-moz-windows-default-theme) {\n';
	sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #browser-bottombox .PuzzlePiece[bottomPlacement][active]:not(:hover):not([hover]) {\n';
	sscode += '				bottom: '+(moveBarStyle.bottom +pieceOffset +OSoffset +shrunkOffset +1)+'px;\n';
	sscode += '			}\n';
	sscode += '		}\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece:not([active]):not(:hover):not([hover]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece[autohide][active]:not(:hover):not([hover]) {\n';
	sscode += '		bottom: '+(moveBarStyle.bottom +pieceOffset +OSoffset -21)+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('positionPPs_'+_UUID, sscode, true);
};

this.choosePP = function() {
	if(!leftPP || !rightPP) { return; }
	
	toggleAttribute(addonBar, 'movetoright', prefAid.movetoRight);
	leftPP.hidden = (prefAid.placement == 'urlbar') || prefAid.movetoRight;
	rightPP.hidden = (prefAid.placement == 'urlbar') || !prefAid.movetoRight;
	
	activatePPs();
};

this.activatePPs = function() {
	toggleAttribute(activePP, 'active', !addonBar.collapsed);
	toggleAttribute(activePP, 'bottomPlacement', prefAid.placement == 'bottom');
};

this.customizePP = function(e) {
	toggleAttribute(activePP, 'customizing', (e.type == 'beforecustomization'));
};

this.showPPs = function() {
	toggleAttribute(leftPP, 'hidePP', !prefAid.showPPs);
	toggleAttribute(rightPP, 'hidePP', !prefAid.showPPs);
	toggleAttribute(addonBar, 'hidePP', !prefAid.showPPs);
};

this.handleFullScreen = function() {
	var inFullScreen = !!gBrowser.mCurrentBrowser.contentDocument.mozFullScreenElement;
	
	setAttribute(addonBar, 'noAnimation', 'true');
	setAttribute(activePP, 'noAnimation', 'true');
	setAttribute(URLBarContainer, 'noAnimation', 'true');
	
	if(URLBarContainer) { URLBarContainer.hidden = inFullScreen; } else { addonBar.hidden = inFullScreen; }
	activePP.hidden = inFullScreen;
	
	aSync(function() {
		removeAttribute(addonBar, 'noAnimation');
		removeAttribute(activePP, 'noAnimation');
		removeAttribute(URLBarContainer, 'noAnimation');
	});
};

moduleAid.LOADMODULE = function() {
	addonBarContextNodes.__defineGetter__('activePP', function() { return activePP; });
	
	listenerAid.add(addonBar, 'WillMoveAddonBar', movePPs);
	listenerAid.add(addonBar, 'ToggledAddonBar', activatePPs);
	listenerAid.add(window, 'beforecustomization', customizePP, false);
	listenerAid.add(window, 'aftercustomization', customizePP, false);
	listenerAid.add(window, 'loadedAddonBarOverlay', choosePP);
	listenerAid.add(window, 'mozfullscreenchange', handleFullScreen);
	
	prefAid.listen('movetoRight', choosePP);
	prefAid.listen('placement', choosePP);
	prefAid.listen('showPPs', showPPs);
	
	choosePP();
	movePPs();
	showPPs();
	moveAddonBar(); // Prevents a bug where the add-on bar would be cropped on startup
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('movetoRight', choosePP);
	prefAid.unlisten('placement', choosePP);
	prefAid.unlisten('showPPs', showPPs);
	
	removeAttribute(addonBar, 'movetoright');
	removeAttribute(addonBar, 'hidePP');
	if(leftPP) { leftPP.hidden = true; }
	if(rightPP) { rightPP.hidden = true; }
	
	listenerAid.remove(addonBar, 'WillMoveAddonBar', movePPs);
	listenerAid.remove(addonBar, 'ToggledAddonBar', activatePPs);
	listenerAid.remove(window, 'beforecustomization', customizePP, false);
	listenerAid.remove(window, 'aftercustomization', customizePP, false);
	listenerAid.remove(window, 'loadedAddonBarOverlay', choosePP);
	listenerAid.remove(window, 'mozfullscreenchange', handleFullScreen);
	
	delete addonBarContextNodes.activePP;
	
	styleAid.unload('positionPPs_'+_UUID);
};
