Modules.VERSION = '1.0.4';

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
	get keycode () { return Prefs.urlbar_keycode; },
	get accel () { return Prefs.urlbar_accel; },
	get shift () { return Prefs.urlbar_shift; },
	get alt () { return Prefs.urlbar_alt; }
};

this.setUrlbarKey = function() {
	if(urlbarKey.keycode != 'none') { Keysets.register(urlbarKey); }
	else { Keysets.unregister(urlbarKey); }
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
		
		Styles.load('urlbarMove_'+_UUID, sscode, true);
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
	urlbarPP.hidden = !Prefs.urlbar_pp;
	toggleAttribute(urlbarBar, 'hidePP', !Prefs.urlbar_pp);
};

this.urlbarAutoHide = function() {
	if(Prefs.urlbar_autohide) {
		initAutoHide(urlbarBar, [urlbarContainer, urlbarPP], urlbarBar, 'opacity');
	} else {
		deinitAutoHide(urlbarBar);
	}
};

// only autohide when the location bar is focused
this.urlbarWhenFocused = function() {
	toggleAttribute(gURLBar, objName+'-WhenFocused', Prefs.urlbar_whenfocused);
};

this.urlbarOnLoad = function() {
	Listeners.add(urlbarBar, 'ToggledPuzzleBar', urlbarOpen);
	Listeners.add(window, 'PuzzleBarsMoved', urlbarMove);
	
	urlbarTogglePP();
	urlbarOpen();
	urlbarMove();
	urlbarWhenFocused();
	urlbarAutoHide();
	
	initBar(urlbarBar, urlbarPP);
	
	Listeners.add(window, 'beforecustomization', urlbarCustomize);
	Listeners.add(window, 'aftercustomization', urlbarCustomize);
	urlbarCustomize(customizing);
};

this.urlbarOnUnload = function() {
	Listeners.remove(window, 'beforecustomization', urlbarCustomize);
	Listeners.remove(window, 'aftercustomization', urlbarCustomize);
	Overlays.removeOverlayWindow(window, 'urlbarCustomize');
	
	deinitAutoHide(urlbarBar);
	deinitBar(urlbarBar, urlbarPP);
	removeAttribute(gURLBar, objName+'-WhenFocused');
	
	Listeners.remove(urlbarBar, 'ToggledPuzzleBar', urlbarOpen);
	Listeners.remove(window, 'PuzzleBarsMoved', urlbarMove);
};

this.urlbarCustomize = function(e) {
	if(e === true || e.type == 'beforecustomization') {
		Overlays.overlayWindow(window, 'urlbarCustomize');
	} else {
		Overlays.removeOverlayWindow(window, 'urlbarCustomize');
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('urlbar_pp', urlbarTogglePP);
	Prefs.listen('urlbar_pp', urlbarAutoHide);
	Prefs.listen('urlbar_autohide', urlbarTogglePP);
	Prefs.listen('urlbar_autohide', urlbarAutoHide);
	Prefs.listen('urlbar_whenfocused', urlbarTogglePP);
	Prefs.listen('urlbar_whenfocused', urlbarAutoHide);
	Prefs.listen('urlbar_whenfocused', urlbarWhenFocused);
	Prefs.listen('urlbar_keycode', setUrlbarKey);
	Prefs.listen('urlbar_accel', setUrlbarKey);
	Prefs.listen('urlbar_shift', setUrlbarKey);
	Prefs.listen('urlbar_alt', setUrlbarKey);
	
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
	
	Overlays.overlayWindow(window, 'urlbar', null, urlbarOnLoad, urlbarOnUnload);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'urlbar');
	Styles.unload('urlbarMove_'+_UUID);
	
	Prefs.unlisten('urlbar_pp', urlbarTogglePP);
	Prefs.unlisten('urlbar_pp', urlbarAutoHide);
	Prefs.unlisten('urlbar_autohide', urlbarTogglePP);
	Prefs.unlisten('urlbar_autohide', urlbarAutoHide);
	Prefs.unlisten('urlbar_whenfocused', urlbarTogglePP);
	Prefs.unlisten('urlbar_whenfocused', urlbarAutoHide);
	Prefs.unlisten('urlbar_whenfocused', urlbarWhenFocused);
	Prefs.unlisten('urlbar_keycode', setUrlbarKey);
	Prefs.unlisten('urlbar_accel', setUrlbarKey);
	Prefs.unlisten('urlbar_shift', setUrlbarKey);
	Prefs.unlisten('urlbar_alt', setUrlbarKey);
	
	if(flexContainers) {
		removeAttribute(locationContainer, 'width');
		removeAttribute(searchContainer, 'width');
	}
	
	if(UNLOADED || !Prefs.urlbar_bar) {
		Keysets.unregister(urlbarKey);
	}
};
