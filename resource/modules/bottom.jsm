Modules.VERSION = '2.0.1';

this.bottom = {
	get box () { return $('browser-bottombox'); },
	get bar () { return $(objName+'-bottom-bar'); },
	get PP () { return $(objName+'-bottom-PP'); },
	
	key: {
		id: objName+'-bottom-key',
		command: objName+':ToggleBottomBar',
		get keycode () { return Prefs.bottom_keycode; },
		get accel () { return Prefs.bottom_accel; },
		get shift () { return Prefs.bottom_shift; },
		get alt () { return Prefs.bottom_alt; }
	},
	
	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'bottom_pp':
				this.togglePP();
				break;
			
			case 'bottom_placement':
				this.placement();
				break;
			
			case 'bottom_keycode':
			case 'bottom_accel':
			case 'bottom_shift':
			case 'bottom_alt':
				this.setKey();
				break;
			
			case 'fullscreen.autohide':
				this.autoHide();
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
		}
	},
	
	attrWatcher: function(obj, prop, oldVal, newVal) {
		this.brightText();
	},
	
	setKey: function() {
		if(this.key.keycode != 'none') { Keysets.register(this.key); }
		else { Keysets.unregister(this.key); }
	},
	
	togglePP: function() {
		this.PP.hidden = !Prefs.bottom_pp;
		toggleAttribute(this.bar, 'hidePP', !Prefs.bottom_pp);
		
		// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
		this.move();
	},
	
	placement: function() {
		toggleAttribute(this.bar, 'movetoright', Prefs.bottom_placement == 'right');
	},
	
	move: function() {
		// Let's account for the transparent bottom border as well if it exists
		var computed = getComputedStyle(this.bar);
		var bottomY = -parseInt(computed.borderBottomWidth);
		
		var left = 2;
		var right = 2;
		
		var OSoffset = (WINNT) ? -2 : 0;
		var ppOffset = this.PP.lastChild.clientHeight -this.PP.clientHeight;
		
		var shrunkOffset = 0;
		var shrunkOffsetHover = 0;
		if(this.bar.clientHeight > 0) {
			var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 25; // when shrunk
			shrunkOffset -= Math.floor((PPsize -this.bar.clientHeight) /2);
			shrunkOffsetHover -= Math.min(Math.floor((PPsize -ppOffset -this.bar.clientHeight) /2), 0);
		}
		
		let sscode = 
			'@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n' +
			'@-moz-document url("'+document.baseURI+'") {\n' +
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([movetoright]) { left: '+(left)+'px; }\n' +
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[movetoright] { right: '+(right)+'px; }\n' +
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([active]) {\n' +
			'		bottom: '+(bottomY +ppOffset +OSoffset)+'px;\n' +
			'	}\n' +
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[active] {\n' +
			'		bottom: '+(bottomY +ppOffset +OSoffset +shrunkOffsetHover)+'px;\n' +
			'	}\n' +
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[active]:not(:hover) {\n' +
			'		bottom: '+(bottomY +ppOffset +OSoffset +shrunkOffset)+'px;\n' +
			'	}\n' +
			'	@media not all and (-moz-windows-classic) {\n' +
			'		@media (-moz-windows-default-theme) {\n' +
			'			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-bottom-PP[active]:not(:hover) {\n' +
			'				bottom: '+(bottomY +ppOffset +OSoffset +shrunkOffset +1)+'px;\n' +
			'			}\n' +
			'		}\n' +
			'	}\n' +
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP:not([active]):not(:hover) {\n' +
			'		bottom: '+(bottomY +ppOffset +OSoffset -21)+'px;\n' +
			'	}\n' +
		
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-PP[autohide][active]:not(:hover):not([hover]),\n' +
			'	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-bottom-bar[autohide]:not(:hover):not([hover]) {\n' +
			'		margin-bottom: '+(1 -this.bar.clientHeight)+'px;\n' +
			'	}\n' +
			'}';
		
		Styles.load('bottomMove_'+_UUID, sscode, true);
	},
	
	brightText: function() {
		toggleAttribute(this.bar, 'brighttext', trueAttribute(gNavBar, 'brighttext'));
	},
	
	autoHide: function() {
		if(onFullScreen.hideBars) {
			autoHide.init(this.bar, [this.bar, this.PP], this.bar, 'margin');
			
			// this would cause the bottom toolbar to appear invisible
			removeAttribute(this.box, 'layer');
		} else {
			setAttribute(this.box, 'layer', 'true');
			autoHide.deinit(this.bar);
		}
	},
	
	onLoad: function() {
		Listeners.add(window, 'PuzzleBarsMoved', this);
		Watchers.addAttributeWatcher(gNavBar, 'brighttext', this);
		
		this.togglePP(); // implies this.move()
		this.placement();
		this.brightText();
		this.autoHide();
		
		bars.init(this.bar, this.PP);
	},
	
	onUnload: function() {
		setAttribute(this.box, 'layer', 'true');
		
		autoHide.deinit(this.bar);
		bars.deinit(this.bar, this.PP);
		
		Watchers.removeAttributeWatcher(gNavBar, 'brighttext', this);
		Listeners.remove(window, 'PuzzleBarsMoved', this);
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('bottom_pp', bottom);
	Prefs.listen('bottom_placement', bottom);
	Prefs.listen('bottom_keycode', bottom);
	Prefs.listen('bottom_accel', bottom);
	Prefs.listen('bottom_shift', bottom);
	Prefs.listen('bottom_alt', bottom);
	Prefs.listen('fullscreen.autohide', bottom);
	onFullScreen.add(bottom);
	
	bottom.setKey();
	
	Overlays.overlayWindow(window, 'bottom', bottom);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'bottom');
	Styles.unload('bottomMove_'+_UUID);
	
	onFullScreen.remove(bottom);
	Prefs.unlisten('fullscreen.autohide', bottom);
	Prefs.unlisten('bottom_pp', bottom);
	Prefs.unlisten('bottom_placement', bottom);
	Prefs.unlisten('bottom_keycode', bottom);
	Prefs.unlisten('bottom_accel', bottom);
	Prefs.unlisten('bottom_shift', bottom);
	Prefs.unlisten('bottom_alt', bottom);
	
	if(UNLOADED || !Prefs.bottom_bar) {
		Keysets.unregister(bottom.key);
	}
};
