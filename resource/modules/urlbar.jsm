moduleAid.VERSION = '1.0.2';

this.__defineGetter__('gURLBar', function() { return window.gURLBar; });
this.__defineGetter__('locationContainer', function() { return $('urlbar-container'); });
this.__defineGetter__('searchContainer', function() { return $('search-container'); });
this.__defineGetter__('urlbarContainer', function() { return $(objName+'-urlbar-container'); });
this.__defineGetter__('urlbarBar', function() { return $(objName+'-urlbar-bar'); });
this.__defineGetter__('urlbarPP', function() { return $(objName+'-urlbar-PP'); });

this.flexContainers = false;

this.urlbarKey = {
	id: objName+'-urlbar-key',
	command: objName+':ToggleURLBarBar',
	get keycode () { return prefAid.urlbar_keycode; },
	get accel () { return prefAid.urlbar_accel; },
	get shift () { return prefAid.urlbar_shift; },
	get alt () { return prefAid.urlbar_alt; }
};

this.setUrlbarKey = function() {
	if(urlbarKey.keycode != 'none') { keysetAid.register(urlbarKey); }
	else { keysetAid.unregister(urlbarKey); }
};

this.urlbarOpen = function() {
	toggleAttribute(urlbarContainer, 'active', !urlbarBar.collapsed);
};

this.startWidth = 0;
this.lastWidth = 0;
this.urlbarMove = function() {
	// Bugfix: Endless loop because width of urlbarBar here is always 0
	if(trueAttribute($('main-window'), 'disablechrome')) { return; }
	
	// Bugfix for the add-on being completely cutoff at startup
	if(urlbarBar.clientWidth == 0) {
		aSync(urlbarMove);
		return;
	}
	
	// if we always reset this sheet, the animation wouldn't happen when toggling on the toolbar
	if(lastWidth != urlbarBar.clientWidth) {
		lastWidth = urlbarBar.clientWidth;
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-urlbar-container[active] {\n';
		sscode += '		width: '+urlbarBar.clientWidth+'px;\n';
		sscode += '	}\n';
		sscode += '}';
		
		styleAid.load('urlbarMove_'+_UUID, sscode, true);
	}
	
	// Bugfix for the add-on being partially cutoff at startup
	if(startWidth == 0) {
		startWidth = urlbarBar.clientWidth;
		if(STARTED == APP_STARTUP) {
			aSync(function() {
				if(urlbarBar.clientWidth != startWidth) { urlbarMove(); }
			}, 1000);
		}
	}
};

this.urlbarTogglePP = function() {
	urlbarPP.hidden = !prefAid.urlbar_pp;
	toggleAttribute(urlbarBar, 'hidePP', !prefAid.urlbar_pp);
};

this.urlbarAutoHide = function() {
	if(prefAid.urlbar_autohide) {
		initAutoHide(urlbarBar, [urlbarContainer, urlbarPP], urlbarBar, 'opacity');
	} else {
		deinitAutoHide(urlbarBar);
	}
};

// only autohide when the location bar is focused
this.urlbarWhenFocused = function() {
	toggleAttribute(gURLBar, objName+'-WhenFocused', prefAid.urlbar_whenfocused);
};

this.urlbarOnLoad = function() {
	listenerAid.add(urlbarBar, 'ToggledPuzzleBar', urlbarOpen);
	listenerAid.add(window, 'PuzzleBarsMoved', urlbarMove);
	
	urlbarTogglePP();
	urlbarOpen();
	urlbarMove();
	urlbarWhenFocused();
	urlbarAutoHide();
	
	initBar(urlbarBar, urlbarPP);
	
	listenerAid.add(window, 'beforecustomization', urlbarCustomize);
	listenerAid.add(window, 'aftercustomization', urlbarCustomize);
	urlbarCustomize(customizing);
};

this.urlbarOnUnload = function() {
	listenerAid.remove(window, 'beforecustomization', urlbarCustomize);
	listenerAid.remove(window, 'aftercustomization', urlbarCustomize);
	overlayAid.removeOverlayWindow(window, 'urlbarCustomize');
	
	deinitAutoHide(urlbarBar);
	deinitBar(urlbarBar, urlbarPP);
	removeAttribute(gURLBar, objName+'-WhenFocused');
	
	listenerAid.remove(urlbarBar, 'ToggledPuzzleBar', urlbarOpen);
	listenerAid.remove(window, 'PuzzleBarsMoved', urlbarMove);
};

this.urlbarCustomize = function(e, force) {
	if(e === true || e.type == 'beforecustomization') {
		overlayAid.overlayWindow(window, 'urlbarCustomize');
	} else {
		overlayAid.removeOverlayWindow(window, 'urlbarCustomize');
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('urlbar_pp', urlbarTogglePP);
	prefAid.listen('urlbar_pp', urlbarAutoHide);
	prefAid.listen('urlbar_autohide', urlbarTogglePP);
	prefAid.listen('urlbar_autohide', urlbarAutoHide);
	prefAid.listen('urlbar_whenfocused', urlbarTogglePP);
	prefAid.listen('urlbar_whenfocused', urlbarAutoHide);
	prefAid.listen('urlbar_whenfocused', urlbarWhenFocused);
	prefAid.listen('urlbar_keycode', setUrlbarKey);
	prefAid.listen('urlbar_accel', setUrlbarKey);
	prefAid.listen('urlbar_shift', setUrlbarKey);
	prefAid.listen('urlbar_alt', setUrlbarKey);
	
	setUrlbarKey();
	
	// Prevent the location bar's flex attribute from taking over and moving stuff when we hover/open the add-on bar in it
	if(locationContainer
	&& searchContainer
	&& locationContainer.parentNode == searchContainer.parentNode
	&& !locationContainer.getAttribute('width')
	&& !searchContainer.getAttribute('width')) {
		flexContainers = true;
		var urlbarWidth = locationContainer.clientWidth;
		var searchWidth = searchContainer.clientWidth;
		setAttribute(locationContainer, 'width', urlbarWidth);
		setAttribute(searchContainer, 'width', searchWidth);
	}
	
	overlayAid.overlayWindow(window, 'urlbar', null, urlbarOnLoad, urlbarOnUnload);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'urlbar');
	styleAid.unload('urlbarMove_'+_UUID);
	
	prefAid.unlisten('urlbar_pp', urlbarTogglePP);
	prefAid.unlisten('urlbar_pp', urlbarAutoHide);
	prefAid.unlisten('urlbar_autohide', urlbarTogglePP);
	prefAid.unlisten('urlbar_autohide', urlbarAutoHide);
	prefAid.unlisten('urlbar_whenfocused', urlbarTogglePP);
	prefAid.unlisten('urlbar_whenfocused', urlbarAutoHide);
	prefAid.unlisten('urlbar_whenfocused', urlbarWhenFocused);
	prefAid.unlisten('urlbar_keycode', setUrlbarKey);
	prefAid.unlisten('urlbar_accel', setUrlbarKey);
	prefAid.unlisten('urlbar_shift', setUrlbarKey);
	prefAid.unlisten('urlbar_alt', setUrlbarKey);
	
	if(flexContainers) {
		removeAttribute(locationContainer, 'width');
		removeAttribute(searchContainer, 'width');
	}
	
	if(UNLOADED || !prefAid.urlbar_bar) {
		keysetAid.unregister(urlbarKey);
	}
};
