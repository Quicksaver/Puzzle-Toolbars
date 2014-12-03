Modules.VERSION = '1.1.8';

this.PP_OFFSET_CORNER = 0;

this.__defineGetter__('gFindBar', function() { return window.gFindBar; });
this.__defineGetter__('bottomBox', function() { return $('browser-bottombox'); });
this.__defineGetter__('cornerContainer', function() { return $(objName+'-corner-container'); });
this.__defineGetter__('cornerBar', function() { return $(objName+'-corner-bar'); });
this.__defineGetter__('cornerPP', function() { return $(objName+'-corner-PP'); });

this.cornerKey = {
	id: objName+'-corner-key',
	command: objName+':ToggleCornerBar',
	get keycode () { return Prefs.corner_keycode; },
	get accel () { return Prefs.corner_accel; },
	get shift () { return Prefs.corner_shift; },
	get alt () { return Prefs.corner_alt; }
};

this.setCornerKey = function() {
	if(cornerKey.keycode != 'none') { Keysets.register(cornerKey); }
	else { Keysets.unregister(cornerKey); }
};

this.cornerStyle = {};
this.cornerMove = function() {
	Timers.cancel('delayCornerMove');
	
	var appContentPos = $('content').getBoundingClientRect();
	cornerStyle.maxWidth = -(scrollBarWidth *2) +appContentPos.width -PP_OFFSET_CORNER /* account for the puzzle piece */;
	cornerStyle.bottom = document.documentElement.clientHeight -appContentPos.bottom;
	cornerStyle.left = scrollBarWidth +appContentPos.left;
	cornerStyle.right = scrollBarWidth +document.documentElement.clientWidth -appContentPos.right;
	cornerStyle.findbarHidden = true;
	
	// Compatibility with TreeStyleTab
	var TabsToolbar = $('TabsToolbar');
	if(TabsToolbar && !TabsToolbar.collapsed
	&& (TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left' || TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right')) {
		var TabsSplitter = document.getAnonymousElementByAttribute($('content'), 'class', 'treestyletab-splitter');
		cornerStyle.maxWidth -= TabsToolbar.clientWidth;
		cornerStyle.maxWidth -= TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
		if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left') {
			cornerStyle.left += TabsToolbar.clientWidth;
			cornerStyle.left += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
		}
		else if(TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right') {
			cornerStyle.right += TabsToolbar.clientWidth;
			cornerStyle.right += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
		}
	}
	
	// Firefox 25 introduced per-tab findbars. The findbar is now a part of appcontent, so we have to account for its height as well
	if(window.gFindBarInitialized
	&& !gFindBar.hidden
	&& gFindBar.getAttribute('position') != 'top'
	&& !trueAttribute(gFindBar, 'movetotop')) {
		cornerStyle.findbarHidden = false;
		cornerStyle.bottom += gFindBar.clientHeight +gFindBar.clientTop;
	}
	
	// Let's account for the transparent bottom border as well if it exists
	var cornerBarStyle = getComputedStyle(cornerBar);
	var cornerBarBorderBottom = parseInt(cornerBarStyle.getPropertyValue('border-bottom-width'));
	cornerStyle.bottom -= cornerBarBorderBottom;
	
	// Let's try to show it like it's poping up from somewhere when there's something below it
	if(cornerStyle.bottom > 1) { cornerStyle.bottom--; }
	
	// Account for the puzzle piece
	cornerStyle.left += PP_OFFSET_CORNER;
	cornerStyle.right += PP_OFFSET_CORNER;
	
	var clipOffHeight = cornerContainer.clientHeight +cornerContainer.clientTop;
	var barOffset = clipOffHeight -Prefs.corner_hotspotHeight;
	if(cornerStyle.bottom > 1) { clipOffHeight += cornerBarBorderBottom; }
	
	var OSoffset = (WINNT) ? -2 : 0;
	var ppOffset = cornerPP.lastChild.clientHeight -cornerPP.clientHeight;
	
	var shrunkOffset = 0;
	var shrunkOffsetHover = 0;
	if(cornerContainer.clientHeight > 0) {
		var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 25; // when shrunk
		shrunkOffset -= Math.floor((PPsize -cornerContainer.clientHeight) /2);
		shrunkOffsetHover -= Math.min(Math.floor((PPsize -ppOffset -cornerContainer.clientHeight) /2), 0);
	}
	
	var ppActiveHiddenOffset = -27 +Prefs.corner_hotspotHeight;
	var ppHiddenOffset = -21;
	var ppActiveHiddenClip = -6 +Prefs.corner_hotspotHeight;
	
	toggleAttribute(cornerPP, 'clipped', cornerStyle.bottom == 1);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container:not([movetoright]) { left: '+cornerStyle.left+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[movetoright] { right: '+cornerStyle.right+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container {\n';
	sscode += '		bottom: '+cornerStyle.bottom+'px;\n';
	sscode += '		max-width: '+Math.max(cornerStyle.maxWidth, 5)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[extend] {\n';
	sscode += '		min-width: '+Math.max(cornerStyle.maxWidth, 5)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container:not([autohide]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[autohide]:-moz-any([hover],:hover) {\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+clipOffHeight+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[collapsed="true"],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[autohide]:not([hover]):not(:hover) {\n';
	sscode += '		bottom: '+(cornerStyle.bottom -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+Prefs.corner_hotspotHeight+'px, 0px);\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP:not([movetoright]) { left: '+(cornerStyle.left -PP_OFFSET_CORNER)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[movetoright] { right: '+(cornerStyle.right -PP_OFFSET_CORNER)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP {\n';
	sscode += '		bottom: '+(cornerStyle.bottom +ppOffset +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[active] {\n';
	sscode += '		bottom: '+(cornerStyle.bottom +ppOffset +OSoffset +shrunkOffsetHover)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[active]:not(:hover) {\n';
	sscode += '		bottom: '+(cornerStyle.bottom +ppOffset +OSoffset +shrunkOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	@media not all and (-moz-windows-classic) {\n';
	sscode += '		@media (-moz-windows-default-theme) {\n';
	sscode += '			window['+objName+'_UUID="'+_UUID+'"][sizemode="normal"] #'+objName+'-corner-PP[active]:not(:hover) {\n';
	sscode += '				bottom: '+(cornerStyle.bottom +ppOffset +OSoffset +shrunkOffset +1)+'px;\n';
	sscode += '			}\n';
	sscode += '		}\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP:not([active]):not(:hover) {\n';
	sscode += '		bottom: '+(cornerStyle.bottom +ppOffset +OSoffset +ppHiddenOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[autohide][active]:not(:hover):not([hover]) {\n';
	sscode += '		bottom: '+(cornerStyle.bottom +ppOffset +OSoffset +ppActiveHiddenOffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[autohide][active]:not(:hover):not([hover]) {\n';
	sscode += '		clip: rect(0px, 32px, '+ppActiveHiddenClip+'px, 0px);\n';
	sscode += '	}\n';
	
	sscode += '}';
	
	Styles.load('cornerMove_'+_UUID, sscode, true);
	
	personaChanged();
};

this.delayCornerMove = function() {
	Timers.init('delayCornerMove', cornerMove, 250);
};

this.tabSelectCornerBar = function() {
	var findbar = !(window.gFindBarInitialized && !gFindBar.hidden && gFindBar.getAttribute('position') != 'top' && !trueAttribute(gFindBar, 'movetotop'));
	if(cornerStyle && cornerStyle.findbarHidden != findbar) {
		delayMoveBars();
	}
};

// Australis isn't really built for the lw-theme footer, plus it might go away someday.
// despite this, I'm keeping it for now, no harm in it after all, and looks nice for personas that still use the footer image.
this.lwtheme = {
	bgImage: '',
	color: '',
	bgColor: ''
};

this.personaChanged = function() {
	if(!UNLOADED) { aSync(styleCornerPersona); }
};

this.styleCornerPersona = function() {
	if(!trueAttribute(bottomBox, 'lwthemefooter')) {
		lwtheme.bgImage = '';
		lwtheme.color = '';
		lwtheme.bgColor = '';
	}
	else {
		var boxStyle = getComputedStyle(bottomBox);
		if(lwtheme.bgImage != boxStyle.getPropertyValue('background-image') && boxStyle.getPropertyValue('background-image') != 'none') {
			lwtheme.bgImage = boxStyle.getPropertyValue('background-image');
			lwtheme.color = boxStyle.getPropertyValue('color');
			lwtheme.bgColor = boxStyle.getPropertyValue('background-color');
		}
	}
	
	// Unload current stylesheet if it's been loaded, just in case we're changing personas
	if(!lwtheme.bgImage) {
		Styles.unload('cornerPersona_'+_UUID);
		return;
	}
	
	if(Prefs.corner_placement == 'left') {
		var offsetPersonaX = -cornerStyle.left -cornerContainer.clientLeft +parseInt(boxStyle.getPropertyValue('border-left-width'));
	} else {
		var offsetPersonaX =
			-bottomBox.clientWidth
			+cornerStyle.right
			+cornerContainer.clientWidth
			+cornerContainer.clientLeft
			-parseInt(boxStyle.getPropertyValue('border-left-width'));
	}
	
	var offsetPersonaY =
		+cornerContainer.clientHeight
		+cornerStyle.bottom
		+cornerContainer.clientTop
		-parseInt(boxStyle.getPropertyValue('border-bottom-width'));
	if(cornerStyle.bottom > 1) { offsetPersonaY--; }
	
	var offsetPadding = boxStyle.getPropertyValue('background-position');
	if(offsetPadding.indexOf(' ') > -1 && offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1) > -1) {
		offsetPersonaY += parseInt(offsetPadding.substr(offsetPadding.indexOf(' ') +1, offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1)));
	}
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container {\n';
	sscode += '	  background-image: ' + lwtheme.bgImage + ' !important;\n';
	sscode += '	  background-color: ' + lwtheme.bgColor + ' !important;\n';
	sscode += '	  color: ' + lwtheme.color + ' !important;\n';
	sscode += '	  background-position: ' + offsetPersonaX + 'px ' +offsetPersonaY+ 'px !important;\n';
	sscode += '	  background-repeat: repeat !important;\n';
	sscode += '	  background-size: auto auto !important;\n';
	sscode += '	}\n';
	sscode += '}';
	
	Styles.load('cornerPersona_'+_UUID, sscode, true);
};

this.cornerBrightText = function() {
	toggleAttribute(cornerBar, 'brighttext', trueAttribute(gNavBar, 'brighttext'));
};

this.cornerTogglePP = function() {
	cornerPP.hidden = !Prefs.corner_pp;
	toggleAttribute(cornerBar, 'hidePP', !Prefs.corner_pp);
	
	// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
	cornerMove();
};

this.cornerPlacement = function() {
	toggleAttribute(cornerBar, 'movetoright', Prefs.corner_placement == 'right');
};

this.cornerAutoHide = function() {
	if(Prefs.corner_autohide || onFullScreen.hideBars) {
		initAutoHide(cornerBar, [cornerContainer, cornerPP], cornerContainer, 'opacity');
	} else {
		deinitAutoHide(cornerBar);
	}
};

this.cornerExtend = function(persona) {
	toggleAttribute(cornerContainer, 'extend', Prefs.corner_extend);
	
	if(persona) {
		personaChanged();
	}
};

this.cornerOnLoad = function() {
	// bugfix: on startup the toolbar and puzzle piece would slide down across the whole window
	setAttribute(document.documentElement, objName+'-noAnimation', 'true');
	
	Listeners.add(window, 'PuzzleBarsMoved', cornerMove);
	Listeners.add(gBrowser.tabContainer, 'TabSelect', tabSelectCornerBar);
	Observers.add(personaChanged, "lightweight-theme-styling-update");
	Watchers.addAttributeWatcher(gNavBar, 'brighttext', cornerBrightText);
	
	cornerTogglePP(); // implies cornerMove()
	cornerPlacement();
	cornerExtend();
	cornerAutoHide();
	cornerBrightText();
	
	initBar(cornerBar, cornerPP);
	
	Listeners.add(window, 'beforecustomization', cornerCustomize);
	Listeners.add(window, 'aftercustomization', cornerCustomize);
	cornerCustomize(customizing);
	
	aSync(function() {
		removeAttribute(document.documentElement, objName+'-noAnimation');
	});
};

this.cornerOnUnload = function() {
	Listeners.remove(window, 'beforecustomization', cornerCustomize);
	Listeners.remove(window, 'aftercustomization', cornerCustomize);
	Overlays.removeOverlayWindow(window, 'cornerCustomize');
	
	deinitAutoHide(cornerBar);
	deinitBar(cornerBar, cornerPP);
	
	Watchers.removeAttributeWatcher(gNavBar, 'brighttext', cornerBrightText);
	Listeners.remove(window, 'PuzzleBarsMoved', cornerMove);
	Listeners.remove(gBrowser.tabContainer, 'TabSelect', tabSelectCornerBar);
	Observers.remove(personaChanged, "lightweight-theme-styling-update");
	
	removeAttribute(document.documentElement, objName+'-noAnimation');
};

this.cornerCustomize = function(e) {
	if(e === true || e.type == 'beforecustomization') {
		Overlays.overlayWindow(window, 'cornerCustomize');
	} else {
		Overlays.removeOverlayWindow(window, 'cornerCustomize');
	}
};

Modules.LOADMODULE = function() {
	Prefs.listen('corner_pp', cornerTogglePP);
	Prefs.listen('corner_placement', cornerPlacement);
	Prefs.listen('corner_autohide', cornerAutoHide);
	Prefs.listen('corner_hotspotHeight', delayCornerMove);
	Prefs.listen('corner_extend', cornerExtend);
	Prefs.listen('corner_keycode', setCornerKey);
	Prefs.listen('corner_accel', setCornerKey);
	Prefs.listen('corner_shift', setCornerKey);
	Prefs.listen('corner_alt', setCornerKey);
	Prefs.listen('fullscreen.autohide', cornerAutoHide);
	onFullScreen.add(cornerAutoHide);
	
	setCornerKey();
	
	Overlays.overlayWindow(window, 'corner', null, cornerOnLoad, cornerOnUnload);
};

Modules.UNLOADMODULE = function() {
	Overlays.removeOverlayWindow(window, 'corner');
	Styles.unload('cornerMove_'+_UUID);
	Styles.unload('cornerPersona_'+_UUID);
	
	onFullScreen.remove(cornerAutoHide);
	Prefs.unlisten('fullscreen.autohide', cornerAutoHide);
	Prefs.unlisten('corner_pp', cornerTogglePP);
	Prefs.unlisten('corner_placement', cornerPlacement);
	Prefs.unlisten('corner_autohide', cornerAutoHide);
	Prefs.unlisten('corner_hotspotHeight', delayCornerMove);
	Prefs.unlisten('corner_extend', cornerExtend);
	Prefs.unlisten('corner_keycode', setCornerKey);
	Prefs.unlisten('corner_accel', setCornerKey);
	Prefs.unlisten('corner_shift', setCornerKey);
	Prefs.unlisten('corner_alt', setCornerKey);
	
	if(UNLOADED || !Prefs.corner_bar) {
		Keysets.unregister(cornerKey);
	}
};
