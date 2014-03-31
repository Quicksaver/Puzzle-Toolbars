moduleAid.VERSION = '1.1.5';

this.__defineGetter__('urlbarContainer', function() { return $('urlbar-container'); });
this.__defineGetter__('searchContainer', function() { return $('search-container'); });

this.flexContainers = false;

this.loadInURLBar = function() {
	URLBarContainer.appendChild(addonBar);
	listenerAid.add(addonBar, 'ToggledAddonBar', openURLBarContainer);
	
	moveAddonBar();
	openURLBarContainer();
	moveContainer();
	autoHideContainer();
	
	if(prefAid.autoHide && prefAid.showPPs) {
		initHovers(); // the button would only be added after this had been called, mousing over it wouldn't work
	}
};

this.unloadInURLBar = function() {
	bottomBox.insertBefore(addonBar, leftPP);
};

this.openURLBarContainer = function() {
	toggleAttribute(URLBarContainer, 'active', !addonBar.collapsed);
	toggleAttribute(URLBarContainer, 'hover', trueAttribute(addonBar, 'hover'));
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
	toggleAttribute(URLBarContainer, 'autohide', prefAid.autoHide && prefAid.showPPs);
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('autoHide', autoHideContainer);
	prefAid.listen('showPPs', autoHideContainer);
	
	// Prevent the location bar's flex attribute from taking over and moving stuff when we hover/open the add-on bar in it
	if(Australis
	&& urlbarContainer
	&& searchContainer
	&& urlbarContainer.parentNode == searchContainer.parentNode
	&& !urlbarContainer.getAttribute('width')
	&& !searchContainer.getAttribute('width')) {
		flexContainers = true;
		var urlbarWidth = urlbarContainer.clientWidth;
		var searchWidth = searchContainer.clientWidth;
		setAttribute(urlbarContainer, 'width', urlbarWidth);
		setAttribute(searchContainer, 'width', searchWidth);
	}
	
	listenerAid.add(addonBar, 'AddonBarMoved', moveContainer);
	
	overlayAid.overlayWindow(window, 'inURLBar', null, loadInURLBar, unloadInURLBar);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(addonBar, 'ToggledAddonBar', openURLBarContainer);
	listenerAid.remove(addonBar, 'AddonBarMoved', moveContainer);
	
	prefAid.unlisten('autoHide', autoHideContainer);
	prefAid.unlisten('showPPs', autoHideContainer);
	
	overlayAid.removeOverlayWindow(window, 'inURLBar');
	
	if(flexContainers) {
		removeAttribute(urlbarContainer, 'width');
		removeAttribute(searchContainer, 'width');
	}
	
	styleAid.unload('moveContainer_'+_UUID);
	
	if(!UNLOADED) {
		delayMoveAddonBar();
	}
};
