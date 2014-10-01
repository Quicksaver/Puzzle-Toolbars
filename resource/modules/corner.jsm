moduleAid.VERSION = '1.0.0';

// ammount of pixels to clip the bar to when it is closed or hidden
this.CLIPBAR = 6;

this.__defineGetter__('gFindBar', function() { return window.gFindBar; });
this.__defineGetter__('bottomBox', function() { return $('browser-bottombox'); });
this.__defineGetter__('cornerContainer', function() { return $(objName+'-corner-container'); });
this.__defineGetter__('cornerBar', function() { return $(objName+'-corner-bar'); });
this.__defineGetter__('cornerPP', function() { return $(objName+'-corner-PP'); });

this.cornerKey = {
	id: objName+'-corner-key',
	command: objName+':ToggleCornerBar',
	get keycode () { return prefAid.corner_keycode; },
	get accel () { return prefAid.corner_accel; },
	get shift () { return prefAid.corner_shift; },
	get alt () { return prefAid.corner_alt; }
};

this.setCornerKey = function() {
	if(cornerKey.keycode != 'none') { keysetAid.register(cornerKey); }
	else { keysetAid.unregister(cornerKey); }
};

var cornerStyle = {};
this.cornerMove = function() {
	var appContentPos = $('content').getBoundingClientRect();
	cornerStyle.maxWidth = -(scrollBarWidth *2) +appContentPos.width;
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
	cornerStyle.left += 12;
	cornerStyle.right += 12;
	
	var barOffset = cornerContainer.clientHeight +cornerContainer.clientTop -CLIPBAR;
	var clipOffHeight = cornerContainer.clientHeight +cornerContainer.clientTop;
	if(cornerStyle.bottom > 1) { clipOffHeight += cornerBarBorderBottom; }
	
	var OSoffset = (WINNT) ? -2 : 0;
	var ppOffset = cornerPP.lastChild.clientHeight -cornerPP.clientHeight;
	
	var shrunkOffset = 0;
	if(cornerContainer.clientHeight > 0) {
		var PPsize = (WINNT) ? 22 : (DARWIN) ? 24 : 28; // when shrunk
		shrunkOffset += Math.floor((PPsize -cornerContainer.clientHeight) /2);
	}
	
	toggleAttribute(cornerPP, 'clipped', cornerStyle.bottom == 1);
	
	styleAid.unload('cornerMove_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container:not([movetoright]) { left: '+cornerStyle.left+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[movetoright] { right: '+cornerStyle.right+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container {\n';
	sscode += '		bottom: '+cornerStyle.bottom+'px;\n';
	sscode += '		max-width: '+Math.max(cornerStyle.maxWidth, 5)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container:not([autohide]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[autohide]:-moz-any([hover],:hover) {\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+clipOffHeight+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[collapsed="true"],\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"]:not([customizing="true"]) #'+objName+'-corner-container[autohide]:not([hover]):not(:hover) {\n';
	sscode += '		bottom: '+(cornerStyle.bottom -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+CLIPBAR+'px, 0px);\n';
	sscode += '	}\n';
	
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP:not([movetoright]) { left: '+(cornerStyle.left -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[movetoright] { right: '+(cornerStyle.right -12)+'px; }\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP {\n';
	sscode += '		bottom: '+(cornerStyle.bottom +ppOffset +OSoffset)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP:not([active]):not(:hover):not([hover]),\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-PP[autohide][active]:not(:hover):not([hover]) {\n';
	sscode += '		bottom: '+(cornerStyle.bottom +ppOffset +OSoffset -21)+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('cornerMove_'+_UUID, sscode, true);
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
	aSync(styleCornerPersona);
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
	
	// Unload current stylesheet if it's been loaded
	styleAid.unload('cornerPersona_'+_UUID);
	
	if(lwtheme.bgImage != '') {
		if(!prefAid.corner_right) {
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
		
		styleAid.load('cornerPersona_'+_UUID, sscode, true);
	}
};

this.cornerTogglePP = function() {
	cornerPP.hidden = !prefAid.corner_pp;
	toggleAttribute(cornerBar, 'hidePP', !prefAid.corner_pp);
	
	// this is done here because if the PP is hidden, its clientHeight is 0, so it needs to update its position when it's shown
	cornerMove();
};

this.cornerRight = function() {
	toggleAttribute(cornerBar, 'movetoright', prefAid.corner_right);
};

this.cornerAutoHide = function() {
	if(prefAid.corner_autohide) {
		initAutoHide(cornerBar, [cornerContainer, cornerPP]);
	} else {
		deinitAutoHide(cornerBar);
	}
};

this.cornerOnLoad = function() {
	listenerAid.add(window, 'PuzzleBarsMoved', cornerMove);
	listenerAid.add(gBrowser.tabContainer, 'TabSelect', tabSelectCornerBar);
	observerAid.add(personaChanged, "lightweight-theme-styling-update");
	
	cornerTogglePP(); // implies cornerMove()
	cornerRight();
	cornerAutoHide();
	
	initBar(cornerBar, cornerPP);
	
	listenerAid.add(window, 'beforecustomization', cornerCustomize);
	listenerAid.add(window, 'aftercustomization', cornerCustomize);
	cornerCustomize(customizing);
};

this.cornerOnUnload = function() {
	listenerAid.remove(window, 'beforecustomization', cornerCustomize);
	listenerAid.remove(window, 'aftercustomization', cornerCustomize);
	
	overlayAid.removeOverlayWindow(window, 'cornerCustomize');
	
	deinitAutoHide(cornerBar);
	deinitBar(cornerBar, cornerPP);
	
	listenerAid.remove(window, 'PuzzleBarsMoved', cornerMove);
	listenerAid.remove(gBrowser.tabContainer, 'TabSelect', tabSelectCornerBar);
	observerAid.remove(personaChanged, "lightweight-theme-styling-update");
};

this.cornerCustomize = function(e, force) {
	if(e === true || e.type == 'beforecustomization') {
		overlayAid.overlayWindow(window, 'cornerCustomize');
	} else {
		overlayAid.removeOverlayWindow(window, 'cornerCustomize');
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('corner_pp', cornerTogglePP);
	prefAid.listen('corner_right', cornerRight);
	prefAid.listen('corner_autohide', cornerAutoHide);
	prefAid.listen('corner_keycode', setCornerKey);
	prefAid.listen('corner_accel', setCornerKey);
	prefAid.listen('corner_shift', setCornerKey);
	prefAid.listen('corner_alt', setCornerKey);
	
	setCornerKey();
	
	overlayAid.overlayWindow(window, 'corner', null, cornerOnLoad, cornerOnUnload);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'corner');
	styleAid.unload('cornerMove_'+_UUID);
	styleAid.unload('cornerPersona_'+_UUID);
	
	prefAid.unlisten('corner_pp', cornerTogglePP);
	prefAid.unlisten('corner_right', cornerRight);
	prefAid.unlisten('corner_keycode', setCornerKey);
	prefAid.unlisten('corner_accel', setCornerKey);
	prefAid.unlisten('corner_shift', setCornerKey);
	prefAid.unlisten('corner_alt', setCornerKey);
	
	if(UNLOADED || !prefAid.corner_bar) {
		keysetAid.unregister(cornerKey);
	}
};
