moduleAid.VERSION = '1.0.0';

this.__defineGetter__('leftPP', function() { return $(objName+'-left-PP'); });
this.__defineGetter__('rightPP', function() { return $(objName+'-right-PP'); });
this.__defineGetter__('activePP', function() { return (prefAid.movetoRight) ? rightPP : leftPP; });

this.commandPP = function(e) {
	if(e.button != 0) { return; }
	toggleAddonBar();
};

this.movePPs = function() {
	toggleAttribute(activePP, 'clipped', lastBarStyle.bottom == 1);
	
	styleAid.unload('positionPPs_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-left-PP { left: '+(lastBarStyle.left -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-right-PP { right: '+(lastBarStyle.right -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece { bottom: '+(lastBarStyle.bottom -8)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece:not([active]):not(:hover) { bottom: '+(lastBarStyle.bottom -8 -19)+'px; }\n';
	sscode += '}';
	
	styleAid.load('positionPPs_'+_UUID, sscode, true);
};

this.choosePP = function() {
	if(!leftPP || !rightPP) {
		listenerAid.add(window, 'loadedAddonBarOverlay', choosePP, false, true);
		return;
	}
	
	toggleAttribute(addonBar, 'movetoright', prefAid.movetoRight);
	leftPP.hidden = prefAid.movetoRight;
	rightPP.hidden = !prefAid.movetoRight;
	
	activatePPs();
};

this.activatePPs = function() {
	toggleAttribute(activePP, 'active', !addonBar.collapsed);
};

moduleAid.LOADMODULE = function() {
	addonBarContextNodes.__defineGetter__('activePP', function() { return activePP; });
	
	listenerAid.add(addonBar, 'WillMoveAddonBar', movePPs);
	listenerAid.add(addonBar, 'ToggledAddonBar', activatePPs);
	
	prefAid.listen('movetoRight', choosePP);
	
	choosePP();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('movetoRight', choosePP);
	
	removeAttribute('movetoright');
	leftPP.hidden = true;
	rightPP.hidden = true;
	
	listenerAid.remove(addonBar, 'WillMoveAddonBar', movePPs);
	listenerAid.remove(addonBar, 'ToggledAddonBar', activatePPs);
	
	delete addonBarContextNodes.activePP;
	
	styleAid.unload('positionPPs_'+_UUID);
};
