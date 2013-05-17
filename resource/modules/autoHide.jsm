moduleAid.VERSION = '1.0.6';

this.onMouseOver = function() {
	setHover(true);
};

this.onMouseOut = function() {
	setHover(false);
};

this.onDragEnter = function() {
	setHover(true, 1);
	listenerAid.add(window.gBrowser, "dragenter", onDragExitAll, false);
	listenerAid.add(window, "dragdrop", onDragExitAll, false);
	listenerAid.add(window, "dragend", onDragExitAll, false);
};

this.onDragExit = function() {
	setHover(false);
};

this.onDragExitAll = function() {
	listenerAid.remove(window.gBrowser, "dragenter", onDragExitAll, false);
	listenerAid.remove(window, "dragdrop", onDragExitAll, false);
	listenerAid.remove(window, "dragend", onDragExitAll, false);
	setHover(false);
};

this.setHover = function(hover, force) {
	if(hover) {
		addonBar.hovers++;
		setAttribute(addonBar, 'hover', 'true');
		setAttribute(activePP, 'hover', 'true');
		setAttribute(URLBarContainer, 'hover', 'true');
		if(force != undefined && typeof(force) == 'number') {
			addonBar.hovers = force;
		}
	}
	else {
		if(force != undefined && typeof(force) == 'number') {
			addonBar.hovers = force;
		} else if(addonBar.hovers > 0) {
			addonBar.hovers--;
		}
		if(addonBar.hovers == 0) {
			removeAttribute(addonBar, 'hover');
			removeAttribute(activePP, 'hover');
			removeAttribute(URLBarContainer, 'hover');
		}
	}
};

this.initHovers = function() {
	if(!activePP) {
		listenerAid.add(window, 'loadedAddonBarOverlay', initHovers, true, true);
		return;
	}
	
	setAttribute(activePP, 'autohide', 'true');
	toggleAttribute(activePP, 'hover', activePP.hovers > 0);
	
	listenerAid.add(activePP, 'dragenter', onDragEnter);
	listenerAid.add(activePP, 'dragexit', onDragExit);
	listenerAid.add(activePP, 'mouseover', onMouseOver);
	listenerAid.add(activePP, 'mouseout', onMouseOut);
	listenerAid.add(activePP, 'toggledAddonBarThroughButton', initialThroughButton);
};

this.moveAutoHide = function() {
	var OSoffset = (Services.appinfo.OS != 'WINNT') ? 3 : 8;
	var barOffset = addonBar.clientHeight -CLIPBAR;
	
	styleAid.unload('autoHide_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar:not([inURLBar])[autohide]:not([customizing="true"]):not([hover]):not(:hover) {\n';
	sscode += '		bottom: '+(moveBarStyle.bottom -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+/*(addonBar.clientWidth +(addonBar.clientLeft *2))*/+'4000px, '+CLIPBAR+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar:not([inURLBar])[autohide][hover],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar:not([inURLBar])[autohide]:hover,\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar:not([inURLBar])[autohide][customizing="true"] {\n';
	sscode += '		clip: rect(0px, '+/*(addonBar.clientWidth +(addonBar.clientLeft *2))*/+'4000px, '+(addonBar.clientHeight +1)+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #browser-bottombox .PuzzlePiece:not([customizing])[autohide][active]:not(:hover):not([hover]) { bottom: '+(moveBarStyle.bottom -OSoffset -19)+'px; }\n';
	sscode += '}';
	
	styleAid.load('autoHide_'+_UUID, sscode, true);
};

this.initialShowBar = function() {
	if(addonBar.collapsed) {
		setHover(false, 0);
	} else {
		setHover(true);
		timerAid.init('initialShowBar', function() { if(typeof(setHover) != 'undefined') { setHover(false); } }, 1000);
	}
};

this.initialThroughButton = function() {
	if(!addonBar.collapsed) {
		setHover(true, 2);
	}
};

// Keep add-on bar visible when opening menus within it
this.holdPopupMenu = function(e) {
	var trigger = e.originalTarget.triggerNode;
	
	if(isAncestor(trigger, addonBar) || isAncestor(trigger, activePP) || isAncestor(e.originalTarget, addonBar)) {
		setHover(true);
		var selfRemover = function(ee) {
			if(ee.originalTarget != e.originalTarget) { return; } //submenus
			setHover(false);
			listenerAid.remove(e.target, 'popuphidden', selfRemover);
		}
		listenerAid.add(e.target, 'popuphidden', selfRemover);
	}
};

moduleAid.LOADMODULE = function() {
	setAttribute(addonBar, 'autohide', 'true');
	addonBar.hovers = 0;
	
	listenerAid.add(addonBar, 'dragenter', onDragEnter);
	listenerAid.add(addonBar, 'dragexit', onDragExit);
	listenerAid.add(addonBar, 'mouseover', onMouseOver);
	listenerAid.add(addonBar, 'mouseout', onMouseOut);
	listenerAid.add(addonBar, 'WillMoveAddonBar', moveAutoHide);
	listenerAid.add(addonBar, 'ToggledAddonBar', initialShowBar);
	listenerAid.add(window, 'popupshown', holdPopupMenu, false);
	
	prefAid.listen('movetoRight', initHovers);
	prefAid.listen('inURLBar', initHovers);
	
	initHovers();
	moveAutoHide();
	
	if(!addonBar.collapsed && (STARTED != APP_STARTUP || !prefAid.noInitialShow)) { initialShowBar(); }
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('autoHide_'+_UUID);
	
	prefAid.unlisten('movetoRight', initHovers);
	prefAid.unlisten('inURLBar', initHovers);
	
	removeAttribute(addonBar, 'hover');
	removeAttribute(activePP, 'hover');
	removeAttribute(URLBarContainer, 'hover');
	removeAttribute(addonBar, 'autohide');
	removeAttribute(leftPP, 'autohide');
	removeAttribute(rightPP, 'autohide');
	delete addonBar.hovers;
	
	listenerAid.remove(addonBar, 'dragenter', onDragEnter);
	listenerAid.remove(addonBar, 'dragexit', onDragExit);
	listenerAid.remove(addonBar, 'mouseover', onMouseOver);
	listenerAid.remove(addonBar, 'mouseout', onMouseOut);
	listenerAid.remove(addonBar, 'WillMoveAddonBar', moveAutoHide);
	listenerAid.remove(addonBar, 'ToggledAddonBar', initialShowBar);
	listenerAid.remove(window, 'popupshown', holdPopupMenu, false);
	
	listenerAid.remove(leftPP, 'dragenter', onDragEnter);
	listenerAid.remove(leftPP, 'dragexit', onDragExit);
	listenerAid.remove(leftPP, 'toggledAddonBarThroughButton', initialThroughButton);
	listenerAid.remove(leftPP, 'mouseover', onMouseOver);
	listenerAid.remove(leftPP, 'mouseout', onMouseOut);
	listenerAid.remove(rightPP, 'dragenter', onDragEnter);
	listenerAid.remove(rightPP, 'dragexit', onDragExit);
	listenerAid.remove(rightPP, 'toggledAddonBarThroughButton', initialThroughButton);
	listenerAid.remove(rightPP, 'mouseover', onMouseOver);
	listenerAid.remove(rightPP, 'mouseout', onMouseOut);
	listenerAid.remove(urlbarPP, 'dragenter', onDragEnter);
	listenerAid.remove(urlbarPP, 'dragexit', onDragExit);
	listenerAid.remove(urlbarPP, 'mouseover', onMouseOver);
	listenerAid.remove(urlbarPP, 'mouseout', onMouseOut);
};
