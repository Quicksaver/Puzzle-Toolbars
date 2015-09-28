Modules.VERSION = '2.0.2';

this.__defineGetter__('gURLBar', function() { return window.gURLBar; });
this.__defineGetter__('locationContainer', function() { return $('urlbar-container'); });
this.__defineGetter__('searchContainer', function() { return $('search-container'); });

this.urlbar = {
	get container () { return $(objName+'-urlbar-container'); },
	get bar () { return $(objName+'-urlbar-bar'); },
	get PP () { return $(objName+'-urlbar-PP'); },
	
	flexContainers: false,
	
	key: {
		id: objName+'-urlbar-key',
		command: objName+':ToggleURLBarBar',
		get keycode () { return Prefs.urlbar_keycode; },
		get accel () { return Prefs.urlbar_accel; },
		get shift () { return Prefs.urlbar_shift; },
		get alt () { return Prefs.urlbar_alt; }
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'urlbar_pp':
				this.togglePP();
				break;
			
			case 'urlbar_keycode':
			case 'urlbar_accel':
			case 'urlbar_shift':
			case 'urlbar_alt':
				this.setKey();
				break;
			
			case 'corner_autohide':
				this.autoHide();
				break;
			
			case 'urlbar_whenfocused':
				this.whenFocused();
				break;
		}
	},
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'ToggledPuzzleBar':
				this.isActive();
				break;
				
			case 'PuzzleBarsMoved':
				this.move();
				break;
			
			case 'beforecustomization':
			case 'aftercustomization':
				this.customize(e);
				break;
		}
	},
	
	setKey: function() {
		if(this.key.keycode != 'none') { Keysets.register(this.key); }
		else { Keysets.unregister(this.key); }
	},
	
	isActive: function() {
		toggleAttribute(this.container, 'active', !this.bar.collapsed);
	},
	
	startWidth: 0,
	lastWidth: 0,
	move: function() {
		// Bugfix: Endless loop because width of urlbarBar here is always 0
		if(trueAttribute(document.documentElement, 'disablechrome')) { return; }
		
		// Bugfix for the add-on being completely cutoff at startup
		if(this.bar.clientWidth == 0) {
			aSync(() => { this.move(); });
			return;
		}
		
		// if we always reset this sheet, the animation wouldn't happen when toggling on the toolbar
		if(this.lastWidth != this.bar.clientWidth) {
			this.lastWidth = this.bar.clientWidth;
			
			let sscode = '\
				@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
				@-moz-document url("'+document.baseURI+'") {\n\
					window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-urlbar-container[active] {\n\
						width: '+this.bar.clientWidth+'px;\n\
					}\n\
				}';
			
			Styles.load('urlbarMove_'+_UUID, sscode, true);
		}
		
		// Bugfix for the add-on being partially cutoff at startup
		if(this.startWidth == 0) {
			this.startWidth = this.bar.clientWidth;
			if(STARTED == APP_STARTUP) {
				aSync(() => {
					if(this.bar.clientWidth != this.startWidth) { this.move(); }
				}, 1000);
			}
		}
	},
	
	togglePP: function() {
		this.PP.hidden = !Prefs.urlbar_pp;
		toggleAttribute(this.bar, 'hidePP', !Prefs.urlbar_pp);
	},
	
	autoHide: function() {
		if(Prefs.urlbar_autohide) {
			autoHide.init(this.bar, [this.container, this.PP], this.bar, 'opacity');
		} else {
			autoHide.deinit(this.bar);
		}
	},
	
	// only autohide when the location bar is focused
	whenFocused: function() {
		toggleAttribute(gURLBar, objName+'-WhenFocused', Prefs.urlbar_whenfocused);
	},
	
	customize: function(e) {
		if(e === true || e.type == 'beforecustomization') {
			Overlays.overlayWindow(window, 'urlbarCustomize');
		} else {
			Overlays.removeOverlayWindow(window, 'urlbarCustomize');
		}
	},
	
	onLoad: function() {
		Listeners.add(this.bar, 'ToggledPuzzleBar', this);
		Listeners.add(window, 'PuzzleBarsMoved', this);
		
		this.togglePP();
		this.isActive();
		this.move();
		this.whenFocused();
		this.autoHide();
		
		bars.init(this.bar, this.PP);
		
		Listeners.add(window, 'beforecustomization', this);
		Listeners.add(window, 'aftercustomization', this);
		this.customize(customizing);
	},
	
	onUnload: function() {
		Listeners.remove(window, 'beforecustomization', this);
		Listeners.remove(window, 'aftercustomization', this);
		Overlays.removeOverlayWindow(window, 'urlbarCustomize');
		
		autoHide.deinit(this.bar);
		bars.deinit(this.bar, this.PP);
		removeAttribute(gURLBar, objName+'-WhenFocused');
		
		Listeners.remove(this.bar, 'ToggledPuzzleBar', this);
		Listeners.remove(window, 'PuzzleBarsMoved', this);
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('urlbar_pp', urlbar);
	Prefs.listen('urlbar_autohide', urlbar);
	Prefs.listen('urlbar_whenfocused', urlbar);
	Prefs.listen('urlbar_keycode', urlbar);
	Prefs.listen('urlbar_accel', urlbar);
	Prefs.listen('urlbar_shift', urlbar);
	Prefs.listen('urlbar_alt', urlbar);
	
	urlbar.setKey();
	
	// Prevent the location bar's flex attribute from taking over and moving stuff when we hover/open the add-on bar in it
	if(locationContainer
	&& searchContainer
	&& locationContainer.parentNode == searchContainer.parentNode
	&& !locationContainer.getAttribute('width')
	&& !searchContainer.getAttribute('width')) {
		urlbar.flexContainers = true;
		setAttribute(locationContainer, 'width', locationContainer.clientWidth);
		setAttribute(searchContainer, 'width', searchContainer.clientWidth);
	}
	
	Overlays.overlayWindow(window, 'urlbar', urlbar);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'urlbar');
	Styles.unload('urlbarMove_'+_UUID);
	
	Prefs.unlisten('urlbar_pp', urlbar);
	Prefs.unlisten('urlbar_autohide', urlbar);
	Prefs.unlisten('urlbar_whenfocused', urlbar);
	Prefs.unlisten('urlbar_keycode', urlbar);
	Prefs.unlisten('urlbar_accel', urlbar);
	Prefs.unlisten('urlbar_shift', urlbar);
	Prefs.unlisten('urlbar_alt', urlbar);
	
	if(urlbar.flexContainers) {
		removeAttribute(locationContainer, 'width');
		removeAttribute(searchContainer, 'width');
	}
	
	if(UNLOADED || !Prefs.urlbar_bar) {
		Keysets.unregister(urlbar.key);
	}
};
