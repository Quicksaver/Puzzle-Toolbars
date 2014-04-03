moduleAid.VERSION = '1.1.10';

this.onMouseOver = function() {
	setHover(true);
};

this.onMouseOut = function() {
	setHover(false);
};

this.onDragEnter = function() {
	setHover(true, 1);
	listenerAid.add(gBrowser, "dragenter", onDragExitAll, false);
	listenerAid.add(window, "drop", onDragExitAll, false);
	listenerAid.add(window, "dragend", onDragExitAll, false);
};

this.onDragExit = function() {
	setHover(false);
};

this.onDragExitAll = function() {
	listenerAid.remove(gBrowser, "dragenter", onDragExitAll, false);
	listenerAid.remove(window, "drop", onDragExitAll, false);
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
	if(!activePP) { return; }
	
	setAttribute(activePP, 'autohide', 'true');
	toggleAttribute(activePP, 'hover', activePP.hovers > 0);
	
	listenerAid.add(activePP, 'dragenter', onDragEnter);
	listenerAid.add(activePP, 'mouseover', onMouseOver);
	listenerAid.add(activePP, 'mouseout', onMouseOut);
	listenerAid.add(activePP, 'toggledAddonBarThroughButton', initialThroughButton);
};

this.moveAutoHide = function() {
	var barOffset = addonBar.clientHeight +addonBar.clientTop -CLIPBAR;
	var clipOffHeight = moveBarStyle.clientHeight +moveBarStyle.clientTop;
	if(moveBarStyle.bottom > 1) { clipOffHeight += moveBarStyle.clientBottom; }
	
	styleAid.unload('autoHide_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] .addon-bar[placement="corner"][autohide]:not([hover]):not(:hover) {\n';
	sscode += '		bottom: '+(moveBarStyle.bottom -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+CLIPBAR+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] .addon-bar[placement="corner"][autohide][hover],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] .addon-bar[placement="corner"][autohide]:hover {\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+clipOffHeight+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('autoHide_'+_UUID, sscode, true);
};

this.delayInitialShowBar = function() {
	timerAid.init('delayInitialShowBar', function() {
		if(typeof(initialShowBar) == 'undefined') { return; }
		initialShowBar();
	}, 50);
};

this.initialShowBar = function() {
	if(addonBar.collapsed) {
		setHover(false, 0);
	} else {
		setHover(true);
		// don't use timerAid, because if we use multiple initialShowBar()'s it would get stuck open
		aSync(function() { if(typeof(setHover) != 'undefined') { setHover(false); } }, 1500);
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
	var hold = false;
	
	// special case for the downloadsPanel
	if(e.target.id == 'downloadsPanel') {
		hold = isAncestor($('downloads-button'), addonBar);
	}
	
	// check if the trigger node is present in the addonBar
	if(!hold) {
		hold = isAncestor(trigger, addonBar) || isAncestor(trigger, activePP) || isAncestor(e.originalTarget, addonBar);
	}
	
	// could be a CUI panel opening, which doesn't carry a triggerNode, we have to find it ourselves
	if(!hold && !trigger && e.target.id == 'customizationui-widget-panel') {
		for(var c=0; c<addonBar.childNodes.length; c++) {
			if(addonBar.childNodes[c].open) {
				hold = true;
				break;
			}
		}
	}
	
	if(hold) {
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
	listenerAid.add(addonBar, 'mouseover', onMouseOver);
	listenerAid.add(addonBar, 'mouseout', onMouseOut);
	listenerAid.add(addonBar, 'WillMoveAddonBar', moveAutoHide);
	listenerAid.add(addonBar, 'ToggledAddonBar', initialShowBar);
	listenerAid.add(addonBar, 'ChangedAddonBarPlacement', delayInitialShowBar);
	listenerAid.add(addonBar, 'AddonBarCustomized', initialShowBar);
	listenerAid.add(window, 'loadedAddonBarOverlay', initHovers);
	listenerAid.add(window, 'popupshown', holdPopupMenu, false);
	
	prefAid.listen('movetoRight', initHovers);
	prefAid.listen('placement', initHovers);
	
	initHovers();
	moveAutoHide();
	
	if(!addonBar.collapsed && (STARTED != APP_STARTUP || !prefAid.noInitialShow)) { initialShowBar(); }
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('autoHide_'+_UUID);
	
	prefAid.unlisten('movetoRight', initHovers);
	prefAid.unlisten('placement', initHovers);
	
	removeAttribute(addonBar, 'hover');
	removeAttribute(activePP, 'hover');
	removeAttribute(URLBarContainer, 'hover');
	removeAttribute(addonBar, 'autohide');
	removeAttribute(leftPP, 'autohide');
	removeAttribute(rightPP, 'autohide');
	delete addonBar.hovers;
	
	listenerAid.remove(addonBar, 'dragenter', onDragEnter);
	listenerAid.remove(addonBar, 'mouseover', onMouseOver);
	listenerAid.remove(addonBar, 'mouseout', onMouseOut);
	listenerAid.remove(addonBar, 'WillMoveAddonBar', moveAutoHide);
	listenerAid.remove(addonBar, 'ToggledAddonBar', initialShowBar);
	listenerAid.remove(addonBar, 'ChangedAddonBarPlacement', delayInitialShowBar);
	listenerAid.remove(addonBar, 'AddonBarCustomized', initialShowBar);
	listenerAid.remove(window, 'loadedAddonBarOverlay', initHovers);
	listenerAid.remove(window, 'popupshown', holdPopupMenu, false);
	
	listenerAid.remove(leftPP, 'dragenter', onDragEnter);
	listenerAid.remove(leftPP, 'toggledAddonBarThroughButton', initialThroughButton);
	listenerAid.remove(leftPP, 'mouseover', onMouseOver);
	listenerAid.remove(leftPP, 'mouseout', onMouseOut);
	listenerAid.remove(rightPP, 'dragenter', onDragEnter);
	listenerAid.remove(rightPP, 'toggledAddonBarThroughButton', initialThroughButton);
	listenerAid.remove(rightPP, 'mouseover', onMouseOver);
	listenerAid.remove(rightPP, 'mouseout', onMouseOut);
	listenerAid.remove(urlbarPP, 'dragenter', onDragEnter);
	listenerAid.remove(urlbarPP, 'mouseover', onMouseOver);
	listenerAid.remove(urlbarPP, 'mouseout', onMouseOut);
};
