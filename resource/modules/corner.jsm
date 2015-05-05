Modules.VERSION = '2.0.0';

this.__defineGetter__('gFindBar', function() { return window.gFindBar; });
this.__defineGetter__('bottomBox', function() { return $('browser-bottombox'); });

this.corner = {
	PP_OFFSET: 0,
	
	get container () { return $(objName+'-corner-container'); },
	get bar () { return $(objName+'-corner-bar'); },
	get PP () { return $(objName+'-corner-PP'); },
	
	key: {
		id: objName+'-corner-key',
		command: objName+':ToggleCornerBar',
		get keycode () { return Prefs.corner_keycode; },
		get accel () { return Prefs.corner_accel; },
		get shift () { return Prefs.corner_shift; },
		get alt () { return Prefs.corner_alt; }
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aTopic) {
			case 'nsPref:changed':
				switch(aSubject) {
					case 'corner_pp':
						this.togglePP();
						break;
					
					case 'corner_placement':
						this.placement();
						break;
					
					case 'corner_keycode':
					case 'corner_accel':
					case 'corner_shift':
					case 'corner_alt':
						this.setKey();
						break;
					
					case 'corner_extend':
						this.extend();
						break;
					
					case 'corner_autohide':
					case 'fullscreen.autohide':
						this.autoHide();
						break;
					
					case 'corner_hotspotHeight':
						Timers.init('delayCornerMove', () => { this.move(); }, 250);
						break;
				}
				break;
			
			case 'lightweight-theme-styling-update':
				this.personaChanged();
				break;
		}
	},
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'PuzzleBarsMoved':
				this.move();
				break;
			
			case 'fullscreen':
				this.autoHide();
				break;
			
			case 'TabSelect':
				var findbar = !(window.gFindBarInitialized && !gFindBar.hidden && !trueAttribute(gFindBar, 'movetotop'));
				if(this.style && this.style.findbarHidden != findbar) {
					bars.delayMove();
				}
				break;
			
			case 'beforecustomization':
			case 'aftercustomization':
				this.customize(e);
				break;
		}
	},
	
	attrWatcher: function(obj, prop, oldVal, newVal) {
		this.brightText();
	},
	
	setKey: function() {
		if(this.key.keycode != 'none') { Keysets.register(this.key); }
		else { Keysets.unregister(this.key); }
	},
	
	style: {},
	move: function() {
		Timers.cancel('delayCornerMove');
		
		var appContentPos = $('content').getBoundingClientRect();
		this.style.maxWidth = -(scrollBarWidth *2) +appContentPos.width -this.PP_OFFSET /* account for the puzzle piece */;
		this.style.bottom = document.documentElement.clientHeight -appContentPos.bottom;
		this.style.left = scrollBarWidth +appContentPos.left;
		this.style.right = scrollBarWidth +document.documentElement.clientWidth -appContentPos.right;
		this.style.findbarHidden = true;
		
		// Compatibility with TreeStyleTab
		var TabsToolbar = $('TabsToolbar');
		if(TabsToolbar && !TabsToolbar.collapsed && TabsToolbar.getAttribute('treestyletab-tabbar-autohide-state') != 'hidden'
		&& (TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left' || TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right')) {
			var TabsSplitter = document.getAnonymousElementByAttribute($('content'), 'class', 'treestyletab-splitter');
			this.style.maxWidth -= TabsToolbar.clientWidth;
			this.style.maxWidth -= TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left') {
				this.style.left += TabsToolbar.clientWidth;
				this.style.left += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
			else if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right') {
				this.style.right += TabsToolbar.clientWidth;
				this.style.right += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
		}
		
		// Firefox 25 introduced per-tab findbars. The findbar is now a part of appcontent, so we have to account for its height as well
		if(window.gFindBarInitialized
		&& !gFindBar.hidden
		&& gFindBar.getAttribute('position') != 'top'
		&& !trueAttribute(gFindBar, 'movetotop')) {
			this.style.findbarHidden = false;
			this.style.bottom += gFindBar.clientHeight +gFindBar.clientTop;
		}
		
		// Let's account for the transparent bottom border as well if it exists
		var computed = getComputedStyle(this.bar);
		var borderBottomWidth = parseInt(computed.borderBottomWidth);
		this.style.bottom -= borderBottomWidth;
		
		// Let's try to show it like it's poping up from somewhere when there's something below it
		if(this.style.bottom > 1) { this.style.bottom--; }
		
		// Account for the puzzle piece
		this.style.left += this.PP_OFFSET;
		this.style.right += this.PP_OFFSET;
		
		var clipOffHeight = this.container.clientHeight +this.container.clientTop;
		var barOffset = clipOffHeight -Prefs.corner_hotspotHeight;
		if(this.style.bottom > 1) { clipOffHeight += borderBottomWidth; }
		
		var OSoffset = (WINNT) ? -2 : 0;
		var ppOffset = this.PP.lastChild.clientHeight -this.PP.clientHeight;
		
		var shrunkOffset = 0;
		var shrunkOffsetHover = 0;
		if(this.container.clientHeight > 0) {
			var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 25; // when shrunk
			shrunkOffset -= Math.floor((PPsize -this.container.clientHeight) /2);
			shrunkOffsetHover -= Math.min(Math.floor((PPsize -ppOffset -this.container.clientHeight) /2), 0);
		}
		
		var ppActiveHiddenOffset = -17 +Prefs.corner_hotspotHeight;
		var ppHiddenOffset = -21;
		var ppActiveHiddenClip = -6 +Prefs.corner_hotspotHeight;
		
		toggleAttribute(corner.PP, 'clipped', this.style.bottom == 1);
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container:not([movetoright]) { left: '+this.style.left+'px; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[movetoright] { right: '+this.style.right+'px; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container {\n';
		sscode += '		bottom: '+this.style.bottom+'px;\n';
		sscode += '		max-width: '+Math.max(this.style.maxWidth, 5)+'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[extend] {\n';
		sscode += '		min-width: '+Math.max(this.style.maxWidth, 5)+'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container:not([autohide]),\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[autohide]:-moz-any([hover],:hover) {\n';
		sscode += '		clip: rect(0px, '+4000+'px, '+clipOffHeight+'px, 0px);\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[collapsed="true"],\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[autohide]:not([hover]):not(:hover) {\n';
		sscode += '		bottom: '+(this.style.bottom -barOffset)+'px;\n';
		sscode += '		clip: rect(0px, '+4000+'px, '+Prefs.corner_hotspotHeight+'px, 0px);\n';
		sscode += '	}\n';
		
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP:not([movetoright]) { left: '+(this.style.left -this.PP_OFFSET)+'px; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[movetoright] { right: '+(this.style.right -this.PP_OFFSET)+'px; }\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP {\n';
		sscode += '		bottom: '+(this.style.bottom +ppOffset +OSoffset)+'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[active] {\n';
		sscode += '		bottom: '+(this.style.bottom +ppOffset +OSoffset +shrunkOffsetHover)+'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[active]:not(:hover) {\n';
		sscode += '		bottom: '+(this.style.bottom +ppOffset +OSoffset +shrunkOffset)+'px;\n';
		sscode += '	}\n';
		sscode += '	@media not all and (-moz-windows-classic) {\n';
		sscode += '		@media (-moz-windows-default-theme) {\n';
		sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-corner-PP[active]:not(:hover) {\n';
		sscode += '				bottom: '+(this.style.bottom +ppOffset +OSoffset +shrunkOffset +1)+'px;\n';
		sscode += '			}\n';
		sscode += '		}\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP:not([active]):not(:hover) {\n';
		sscode += '		bottom: '+(this.style.bottom +ppOffset +OSoffset +ppHiddenOffset)+'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[autohide][active]:not(:hover):not([hover]) {\n';
		sscode += '		bottom: '+(this.style.bottom +ppOffset +OSoffset +ppActiveHiddenOffset)+'px;\n';
		sscode += '	}\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[autohide][active]:not(:hover):not([hover]) {\n';
		sscode += '		clip: rect(0px, 32px, '+ppActiveHiddenClip+'px, 0px);\n';
		sscode += '	}\n';
		
		sscode += '}';
		
		Styles.load('cornerMove_'+_UUID, sscode, true);
		
		this.personaChanged();
	},
	
	// Australis isn't really built for the lw-theme footer, plus it might go away someday.
	// despite this, I'm keeping it for now, no harm in it after all, and looks nice for personas that still use the footer image.
	lwtheme: {
		bgImage: '',
		color: '',
		bgColor: ''
	},
	
	personaChanged: function() {
		if(!UNLOADED) { aSync(() => { this.stylePersona(); }); }
	},
	
	stylePersona: function() {
		if(!trueAttribute(this.box, 'lwthemefooter')) {
			this.lwtheme.bgImage = '';
			this.lwtheme.color = '';
			this.lwtheme.bgColor = '';
		}
		else {
			var computed = getComputedStyle(this.box);
			if(this.lwtheme.bgImage != computed.backgroundImage && computed.backgroundImage != 'none') {
				this.lwtheme.bgImage = computed.backgroundImage;
				this.lwtheme.color = computed.color;
				this.lwtheme.bgColor = computed.backgroundColor;
			}
		}
		
		// Unload current stylesheet if it's been loaded, just in case we're changing personas
		if(!this.lwtheme.bgImage) {
			Styles.unload('cornerPersona_'+_UUID);
			return;
		}
		
		if(Prefs.corner_placement == 'left') {
			var offsetPersonaX =
				-this.style.left
				-this.container.clientLeft
				+parseInt(computed.getPropertyValue('border-left-width'));
		} else {
			var offsetPersonaX =
				-this.box.clientWidth
				+this.style.right
				+this.container.clientWidth
				+this.container.clientLeft
				-parseInt(computed.getPropertyValue('border-left-width'));
		}
		
		var offsetPersonaY =
			+this.container.clientHeight
			+this.style.bottom
			+this.container.clientTop
			-parseInt(computed.getPropertyValue('border-bottom-width'));
		if(this.style.bottom > 1) { offsetPersonaY--; }
		
		var offsetPadding = computed.getPropertyValue('background-position');
		if(offsetPadding.indexOf(' ') > -1 && offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1) > -1) {
			offsetPersonaY += parseInt(offsetPadding.substr(offsetPadding.indexOf(' ') +1, offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1)));
		}
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container {\n';
		sscode += '	  background-image: ' + this.lwtheme.bgImage + ' !important;\n';
		sscode += '	  background-color: ' + this.lwtheme.bgColor + ' !important;\n';
		sscode += '	  color: ' + this.lwtheme.color + ' !important;\n';
		sscode += '	  background-position: ' + offsetPersonaX + 'px ' +offsetPersonaY+ 'px !important;\n';
		sscode += '	  background-repeat: repeat !important;\n';
		sscode += '	  background-size: auto auto !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		Styles.load('cornerPersona_'+_UUID, sscode, true);
	},
	
	brightText: function() {
		toggleAttribute(this.bar, 'brighttext', trueAttribute(gNavBar, 'brighttext'));
	},
	
	togglePP: function() {
		this.PP.hidden = !Prefs.corner_pp;
		toggleAttribute(this.bar, 'hidePP', !Prefs.corner_pp);
		
		// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
		this.move();
	},
	
	placement: function() {
		toggleAttribute(this.bar, 'movetoright', Prefs.corner_placement == 'right');
	},
	
	autoHide: function() {
		if(Prefs.corner_autohide || onFullScreen.hideBars) {
			autoHide.init(this.bar, [this.container, this.PP], this.container, 'opacity');
		} else {
			autoHide.deinit(this.bar);
		}
	},
	
	extend: function(persona) {
		toggleAttribute(this.container, 'extend', Prefs.corner_extend);
		this.personaChanged();
	},
	
	customize: function(e) {
		if(e === true || e.type == 'beforecustomization') {
			Overlays.overlayWindow(window, 'cornerCustomize');
		} else {
			Overlays.removeOverlayWindow(window, 'cornerCustomize');
		}
	},
	
	onLoad: function() {
		// bugfix: on startup the toolbar and puzzle piece would slide down across the whole window
		setAttribute(document.documentElement, objName+'-noAnimation', 'true');
		
		Listeners.add(window, 'PuzzleBarsMoved', this);
		Listeners.add(gBrowser.tabContainer, 'TabSelect', this);
		Observers.add(this, "lightweight-theme-styling-update");
		Watchers.addAttributeWatcher(gNavBar, 'brighttext', this);
		
		this.togglePP(); // implies cornerMove()
		this.placement();
		this.extend();
		this.autoHide();
		this.brightText();
		
		bars.init(this.bar, this.PP);
		
		Listeners.add(window, 'beforecustomization', this);
		Listeners.add(window, 'aftercustomization', this);
		this.customize(customizing);
		
		aSync(function() {
			removeAttribute(document.documentElement, objName+'-noAnimation');
		});
	},
	
	onUnload: function() {
		Listeners.remove(window, 'beforecustomization', this);
		Listeners.remove(window, 'aftercustomization', this);
		Overlays.removeOverlayWindow(window, 'cornerCustomize');
		
		autoHide.deinit(this.bar);
		bars.deinit(this.bar, this.PP);
		
		Watchers.removeAttributeWatcher(gNavBar, 'brighttext', this);
		Listeners.remove(window, 'PuzzleBarsMoved', this);
		Listeners.remove(gBrowser.tabContainer, 'TabSelect', this);
		Observers.remove(this, "lightweight-theme-styling-update");
		
		removeAttribute(document.documentElement, objName+'-noAnimation');
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('corner_pp', corner);
	Prefs.listen('corner_placement', corner);
	Prefs.listen('corner_autohide', corner);
	Prefs.listen('corner_hotspotHeight', corner);
	Prefs.listen('corner_extend', corner);
	Prefs.listen('corner_keycode', corner);
	Prefs.listen('corner_accel', corner);
	Prefs.listen('corner_shift', corner);
	Prefs.listen('corner_alt', corner);
	Prefs.listen('fullscreen.autohide', corner);
	onFullScreen.add(corner);
	
	corner.setKey();
	
	Overlays.overlayWindow(window, 'corner', corner);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'corner');
	Styles.unload('cornerMove_'+_UUID);
	Styles.unload('cornerPersona_'+_UUID);
	
	onFullScreen.remove(corner);
	Prefs.unlisten('fullscreen.autohide', corner);
	Prefs.unlisten('corner_pp', corner);
	Prefs.unlisten('corner_placement', corner);
	Prefs.unlisten('corner_autohide', corner);
	Prefs.unlisten('corner_hotspotHeight', corner);
	Prefs.unlisten('corner_extend', corner);
	Prefs.unlisten('corner_keycode', corner);
	Prefs.unlisten('corner_accel', corner);
	Prefs.unlisten('corner_shift', corner);
	Prefs.unlisten('corner_alt', corner);
	
	if(UNLOADED || !Prefs.corner_bar) {
		Keysets.unregister(corner.key);
	}
};
