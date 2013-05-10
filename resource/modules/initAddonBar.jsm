moduleAid.VERSION = '1.1.8';

this.__defineGetter__('addonBar', function() { return $('addon-bar'); });
this.__defineGetter__('bottomBox', function() { return $('browser-bottombox'); });
this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('toggleAddonBar', function() { return window.toggleAddonBar; });
this.__defineSetter__('toggleAddonBar', function(v) { return window.toggleAddonBar = v; });
this.__defineGetter__('setToolbarVisibility', function() { return window.setToolbarVisibility; });
this.__defineGetter__('appMenu', function() { return $('appmenu_customizeMenu'); });
this.__defineGetter__('viewMenu', function() { return $('viewToolbarsMenu').firstChild; });
this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

this.CLIPBAR = 5; // ammount of pixels to clip the bar to when it is closed or hidden

this.addonBarContextNodes = {
	get addonBar () { return addonBar; }
};

this._scrollBarWidth = null;
this.__defineGetter__('scrollBarWidth', function() {
	if(_scrollBarWidth === null) {
		var scrollDiv = document.createElement("div");
		scrollDiv.setAttribute('style', 'width: 100px; height: 100px; overflow: scroll; position: fixed; top: -9999px;');
		scrollDiv = browserPanel.appendChild(scrollDiv);
		
		_scrollBarWidth = 100 -scrollDiv.clientWidth;
		
		browserPanel.removeChild(scrollDiv);
	}
	
	return _scrollBarWidth;
});

this.lwthemeImage = null;
this.moveBarStyle = {};

this.doOpenOptions = function() {
	openOptions();
};

// Menus are dynamic, I need to make sure the entries do what they're supposed to if they're changed
this.setContextMenu = function(e) {
	var notHidden = false;
	for(var n in addonBarContextNodes) {
		if(isAncestor(e.originalTarget.triggerNode, addonBarContextNodes[n])) {
			notHidden = true;
			break;
		}
	}
	toggleAttribute(contextOptions, 'hidden', !notHidden);
	toggleAttribute(contextSeparator, 'hidden', !notHidden);
	
	setAttribute(contextMenu.getElementsByAttribute('toolbarId', 'addon-bar')[0], 'command', 'Browser:ToggleAddonBar');
};

this.setViewMenu = function(e) {
	setAttribute(viewMenu.getElementsByAttribute('toolbarId', 'addon-bar')[0], 'command', 'Browser:ToggleAddonBar');
};

this.setAppMenu = function(e) {
	setAttribute(appMenu.getElementsByAttribute('toolbarId', 'addon-bar')[0], 'command', 'Browser:ToggleAddonBar');
};

this.delayMoveAddonBar = function() {
	timerAid.init('delayMoveAddonBar', moveAddonBar, 0);
};

this.moveAddonBar = function() {
	// We should do all these calculations to also position the puzzle pieces, even if the add-on bar is closed
	moveBarStyle = {
		maxWidth: -(scrollBarWidth *2),
		left: scrollBarWidth,
		right: scrollBarWidth,
		bottom: 0
	};
	
	var appContentPos = $('content').getBoundingClientRect();
	moveBarStyle.maxWidth += appContentPos.width;
	moveBarStyle.bottom += document.documentElement.clientHeight -appContentPos.bottom;
	moveBarStyle.left += appContentPos.left;
	moveBarStyle.right += document.documentElement.clientWidth -appContentPos.right;
	
	// Account for the puzzle piece
	moveBarStyle.left += 12;
	moveBarStyle.right += 12;
	
	// Let's try to show it like it's poping up from somewhere when there's something below it
	if(moveBarStyle.bottom > 1) { moveBarStyle.bottom--; }
	
	moveBarStyle.clientHeight = addonBar.clientHeight;
	moveBarStyle.movetoRight = prefAid.movetoRight;
	moveBarStyle = moveBarStyle;
	
	dispatch(addonBar, { type: "WillMoveAddonBar", cancelable: false });
	
	var barOffset = addonBar.clientHeight -CLIPBAR;
	
	// I find it easier to always just move the add-on bar when this is called, instead of checking every occasion when it isn't visible and should still be moved
	//if(addonBar.collapsed) { return; }
	
	styleAid.unload('positionAddonBar_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar {\n';
	sscode += '		bottom: '+moveBarStyle.bottom+'px;\n';
	sscode += (!prefAid.movetoRight) ? '		left: '+moveBarStyle.left+'px;\n' : '		right: '+moveBarStyle.right+'px;\n';
	sscode += '		max-width: '+Math.max(moveBarStyle.maxWidth, 5)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar:not([autohide]) {\n';
	sscode += '		clip: rect(0px, '+(addonBar.clientWidth +1)+'px, '+(addonBar.clientHeight +1)+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar[collapsed="true"]:not([customizing="true"]) {\n';
	sscode += '		bottom: '+(moveBarStyle.bottom -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+(addonBar.clientWidth +1)+'px, '+CLIPBAR+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('positionAddonBar_'+_UUID, sscode, true);
	
	findPersonaPosition();
	
	dispatch(addonBar, { type: "AddonBarMoved", cancelable: false });
};

this.findPersonaPosition = function() {
	if(bottomBox.getAttribute('lwthemefooter') != 'true') {
		prefAid.lwthemebgImage = '';
		prefAid.lwthemebgWidth = 0;
		prefAid.lwthemebgHeight = 0;
		prefAid.lwthemecolor = '';
		prefAid.lwthemebgColor = '';
		stylePersonaAddonBar();
		return;
	}
	
	var boxStyle = getComputedStyle(bottomBox);
	if(prefAid.lwthemebgImage != boxStyle.getPropertyValue('background-image') && boxStyle.getPropertyValue('background-image') != 'none') {
		prefAid.lwthemebgImage = boxStyle.getPropertyValue('background-image');
		prefAid.lwthemecolor = boxStyle.getPropertyValue('color');
		prefAid.lwthemebgColor = boxStyle.getPropertyValue('background-color');
		prefAid.lwthemebgWidth = 0;
		prefAid.lwthemebgHeight = 0;
		
		lwthemeImage = new window.Image();
		lwthemeImage.onload = function() { findPersonaWidth(); };
		lwthemeImage.src = prefAid.lwthemebgImage.substr(5, prefAid.lwthemebgImage.length - 8);
		return;
	}
	
	stylePersonaAddonBar();
};

this.findPersonaWidth = function() {
	if(prefAid.lwthemebgWidth == 0 && lwthemeImage.naturalWidth != 0) {
		prefAid.lwthemebgWidth = lwthemeImage.naturalWidth;
	}
	if(prefAid.lwthemebgHeight == 0 && lwthemeImage.naturalHeight != 0) {
		prefAid.lwthemebgHeight = lwthemeImage.naturalHeight;
	}
	
	if(prefAid.lwthemebgWidth != 0 && prefAid.lwthemebgHeight != 0) {
		stylePersonaAddonBar();
	}
};

this.stylePersonaAddonBar = function() {
	// Unload current stylesheet if it's been loaded
	styleAid.unload('personaFindBar_'+_UUID);
	
	if(prefAid.lwthemebgImage != '') {
		var boxStyle = getComputedStyle(bottomBox);
		
		var offsetPersonaX = (!prefAid.movetoRight) ? -moveBarStyle.left : -bottomBox.clientWidth +moveBarStyle.right +addonBar.clientWidth;
		
		// Another personas in OSX tweak
		var offsetPersonaY = -prefAid.lwthemebgHeight +moveBarStyle.clientHeight +moveBarStyle.bottom;
		var offsetPadding = boxStyle.getPropertyValue('background-position');
		if(offsetPadding.indexOf(' ') > -1 && offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1) > -1) {
			offsetPersonaY += parseInt(offsetPadding.substr(offsetPadding.indexOf(' ') +1, offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1)));
		}
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar {\n';
		sscode += '	  background-image: ' + prefAid.lwthemebgImage + ' !important;\n';
		sscode += '	  background-color: ' + prefAid.lwthemecolor + ' !important;\n';
		sscode += '	  color: ' + prefAid.lwthemecolor + ' !important;\n';
		sscode += '	  background-position: ' + offsetPersonaX + 'px ' +offsetPersonaY+ 'px !important;\n';
		sscode += '	  background-repeat: repeat !important;\n';
		sscode += '	  background-size: auto auto !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		styleAid.load('personaFindBar_'+_UUID, sscode, true);
	}
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'addonBar', null, function(aWindow) { dispatch(aWindow, { type: "loadedAddonBarOverlay", cancelable: false }); });
	
	this.backups = {
		toggleAddonBar: toggleAddonBar
	};
	
	toggleAddonBar = function toggleAddonBar() {
		setToolbarVisibility(addonBar, addonBar.collapsed);
		dispatch(addonBar, { type: 'ToggledAddonBar', cancelable: false });
	};
	
	prefAid.listen('movetoRight', moveAddonBar);
	
	listenerAid.add(contextMenu, 'popupshown', setContextMenu, false);
	listenerAid.add(viewMenu, 'popupshown', setViewMenu, false);
	listenerAid.add(appMenu, 'popupshown', setAppMenu, false);
	listenerAid.add(browserPanel, 'resize', delayMoveAddonBar);
	listenerAid.add(addonBar, 'ToggledAddonBar', moveAddonBar);
	observerAid.add(findPersonaPosition, "lightweight-theme-changed");
	
	moveAddonBar();
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('positionAddonBar_'+_UUID);
	
	observerAid.remove(findPersonaPosition, "lightweight-theme-changed");
	listenerAid.remove(contextMenu, 'popupshown', setContextMenu, false);
	listenerAid.remove(viewMenu, 'popupshown', setViewMenu, false);
	listenerAid.remove(appMenu, 'popupshown', setAppMenu, false);
	listenerAid.remove(browserPanel, 'resize', delayMoveAddonBar);
	listenerAid.remove(addonBar, 'ToggledAddonBar', moveAddonBar);
	
	prefAid.unlisten('movetoRight', moveAddonBar);
	
	removeAttribute(contextMenu.getElementsByAttribute('toolbarId', 'addon-bar')[0], 'command');
	removeAttribute(viewMenu.getElementsByAttribute('toolbarId', 'addon-bar')[0], 'command');
	removeAttribute(appMenu.getElementsByAttribute('toolbarId', 'addon-bar')[0], 'command');
	
	if(this.backups) {
		toggleAddonBar = this.backups.toggleAddonBar;
		delete this.backups;
	}
	
	overlayAid.removeOverlayWindow(window, 'addonBar');
};
