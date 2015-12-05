// VERSION 2.0.4

this.top = {
	get bar () { return $(objName+'-top-bar'); },
	get PP () { return $(objName+'-top-PP'); },

	key: {
		id: objName+'-top-key',
		command: objName+':ToggleTopBar',
		get keycode () { return Prefs.top_keycode; },
		get accel () { return Prefs.top_accel; },
		get shift () { return Prefs.top_shift; },
		get alt () { return Prefs.top_alt; }
	},

	observe: function(aSubject, aTopic, aData) {
		switch(aSubject) {
			case 'top_pp':
				this.togglePP();
				break;

			case 'top_placement':
				this.placement();
				break;

			case 'top_keycode':
			case 'top_accel':
			case 'top_shift':
			case 'top_alt':
				this.setKey();
				break;
		}
	},

	handleEvent: function(e) {
		switch(e.type) {
			case 'PuzzleBarsMoved':
				this.move();
				break;
		}
	},

	setKey: function() {
		if(this.key.keycode != 'none') { Keysets.register(this.key); }
		else { Keysets.unregister(this.key); }
	},

	togglePP: function() {
		this.PP.hidden = !Prefs.top_pp;
		toggleAttribute(this.bar, 'hidePP', !Prefs.top_pp);

		// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
		this.move();
	},

	placement: function() {
		toggleAttribute(this.bar, 'movetoright', Prefs.top_placement == 'right');
	},

	style: {},
	move: function() {
		// just making sure
		if(!this.bar) { return; }

		var computed = getComputedStyle(this.bar);
		var rect = top.bar.getBoundingClientRect();
		this.style = {
			// Let's account for the transparent top border as well if it exists
			top: rect.top -parseInt(computed.borderTopWidth),
			left: rect.left +2,
			right: document.documentElement.clientWidth -rect.right +2
		};

		var OSoffset = (WINNT) ? -2 : 0;
		var ppOffset = this.PP.lastChild.clientHeight -this.PP.clientHeight;

		var shrunkOffset = 0;
		var shrunkOffsetHover = 0;
		if(this.bar.clientHeight > 0) {
			var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 25; // when shrunk
			shrunkOffset -= Math.floor((PPsize +ppOffset -this.bar.clientHeight) /2);
			shrunkOffsetHover -= Math.min(Math.floor((PPsize -ppOffset -this.bar.clientHeight) /2), 0);
		}

		let sscode = '\
			@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
			@-moz-document url("'+document.baseURI+'") {\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP:not([movetoright]) { left: '+(this.style.left)+'px; }\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP[movetoright] { right: '+(this.style.right)+'px; }\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP:not([active]) {\n\
					top: '+(this.style.top +OSoffset)+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP[active] {\n\
					top: '+(this.style.top +OSoffset +shrunkOffsetHover)+'px;\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP[active]:not(:hover) {\n\
					top: '+(this.style.top +OSoffset +shrunkOffset)+'px;\n\
				}\n\
				@media not all and (-moz-windows-classic) {\n\
					@media (-moz-windows-default-theme) {\n\
						window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-top-PP[active]:not(:hover) {\n\
							top: '+(this.style.top +OSoffset +shrunkOffset +1)+'px;\n\
						}\n\
					}\n\
				}\n\
				window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-top-PP:not([active]):not(:hover) {\n\
					top: '+(this.style.top +OSoffset -21)+'px;\n\
				}\n\
			}';

		Styles.load('topMove_'+_UUID, sscode, true);
	},

	onLoad: function() {
		Listeners.add(window, 'PuzzleBarsMoved', this);

		this.togglePP(); // implies this.move()
		this.placement();

		// make sure it gets the brighttext attribute whenever needed, as this toolbar doesn't add attribute watchers like the others
		window.ToolbarIconColor.inferFromText();

		bars.init(this.bar, this.PP);
	},

	onUnload: function() {
		Listeners.remove(window, 'PuzzleBarsMoved', this);

		// deinitialize bar after we've removed all listeners and handlers, so they don't react to this uselessly
		bars.deinit(this.bar, this.PP);
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('top_pp', top);
	Prefs.listen('top_placement', top);
	Prefs.listen('top_keycode', top);
	Prefs.listen('top_accel', top);
	Prefs.listen('top_shift', top);
	Prefs.listen('top_alt', top);

	top.setKey();

	Overlays.overlayWindow(window, 'top', top);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'top');
	Styles.unload('topMove_'+_UUID);

	Prefs.unlisten('top_pp', top);
	Prefs.unlisten('top_placement', top);
	Prefs.unlisten('top_keycode', top);
	Prefs.unlisten('top_accel', top);
	Prefs.unlisten('top_shift', top);
	Prefs.unlisten('top_alt', top);

	if(UNLOADED || !Prefs.top_bar) {
		Keysets.unregister(top.key);
	}
};
