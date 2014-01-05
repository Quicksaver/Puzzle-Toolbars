moduleAid.VERSION = '1.1.1';

this.__defineGetter__('gBrowser', function() { return window.gBrowser; });

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
	
	var OSoffset = (Services.appinfo.OS != 'WINNT') ? 1 : 6;
	
	styleAid.unload('positionPPs_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-left-PP { left: '+(moveBarStyle.left -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-right-PP { right: '+(moveBarStyle.right -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece { bottom: '+(moveBarStyle.bottom -OSoffset)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece:not([customizing]):not([active]):not(:hover) { bottom: '+(moveBarStyle.bottom -OSoffset -21)+'px; }\n';
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
};

this.customizePP = function(e) {
	toggleAttribute(activePP, 'customizing', (e.type == 'beforecustomization'));
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
	
	choosePP();
	movePPs();
	moveAddonBar(); // Prevents a bug where the add-on bar would be cropped on startup
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('movetoRight', choosePP);
	prefAid.unlisten('placement', choosePP);
	
	removeAttribute('movetoright');
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
