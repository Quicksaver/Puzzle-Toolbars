moduleAid.VERSION = '1.0.6';

this.onCustomizing = function(e) {
	tempMoveAddonBar(e.type == 'beforecustomization');
};

// I can't drag from the add-on bar when it's in the url bar, it only drags the whole url bar in this case
this.tempMoveAddonBar = function(move) {
	toggleAttribute(addonBar, 'inURLBar', !move);
	URLBarContainer.hidden = move;
	if(move) {
		bottomBox.insertBefore(addonBar, leftPP);
	} else {
		URLBarContainer.appendChild(addonBar);
	}
};

this.loadInURLBar = function() {
	URLBarContainer.appendChild(addonBar);
	listenerAid.add(addonBar, 'ToggledAddonBar', openURLBarContainer);
	
	listenerAid.add(window, 'beforecustomization', onCustomizing);
	listenerAid.add(window, 'aftercustomization', onCustomizing);
	
	moveAddonBar();
	openURLBarContainer();
	moveContainer();
	autoHideContainer();
	
	if(prefAid.autoHide) {
		initHovers(); // the button would only be added after this had been called, mousing over it wouldn't work
	}
	
	if(trueAttribute(addonBar, 'customizing')) {
		tempMoveAddonBar(true);
	}
};

this.unloadInURLBar = function() {
	tempMoveAddonBar(true);
};

this.openURLBarContainer = function() {
	toggleAttribute(URLBarContainer, 'active', !addonBar.collapsed);
};

this.lastWidth = 0;
this.moveContainer = function() {
	// Bugfix: Endless loop because width of addonBar here is always 0
	if(trueAttribute($('main-window'), 'disablechrome')) {
		if(isAncestor(addonBar, $('navigator-toolbox'))
		&& trueAttribute($('navigator-toolbox'), 'tabsontop')
		&& !isAncestor(addonBar, $('toolbar-menubar'))
		&& !isAncestor(addonBar, $('TabsToolbar'))) {
			return;
		}
	}
	
	// Bugfix for the add-on being completely cutoff at startup
	if(addonBar.clientWidth == 0) {
		aSync(moveContainer);
		return;
	}
	
	styleAid.unload('moveContainer_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #thePuzzlePiece-urlbar-addonbar-container[active] {\n';
	sscode += '		width: '+addonBar.clientWidth+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('moveContainer_'+_UUID, sscode, true);
	
	// Bugfix for the add-on being partially cutoff at startup
	if(lastWidth == 0) {
		lastWidth = addonBar.clientWidth;
		if(STARTED == APP_STARTUP) {
			aSync(function() {
				if(addonBar.clientWidth != lastWidth) { moveContainer(); }
			}, 1000);
		}
	}
};

this.autoHideContainer = function() {
	toggleAttribute(URLBarContainer, 'autohide', prefAid.autoHide);
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('autoHide', autoHideContainer);
	
	listenerAid.add(addonBar, 'AddonBarMoved', moveContainer);
	
	overlayAid.overlayWindow(window, 'inURLBar', null, loadInURLBar, unloadInURLBar);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(addonBar, 'ToggledAddonBar', openURLBarContainer);
	listenerAid.remove(addonBar, 'AddonBarMoved', moveContainer);
	
	listenerAid.remove(window, 'beforecustomization', onCustomizing);
	listenerAid.remove(window, 'aftercustomization', onCustomizing);
	
	prefAid.unlisten('autoHide', autoHideContainer);
	
	overlayAid.removeOverlayWindow(window, 'inURLBar');
	
	styleAid.unload('moveContainer_'+_UUID);
	
	if(!UNLOADED) {
		delayMoveAddonBar();
	}
};
