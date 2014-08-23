moduleAid.VERSION = '1.3.1';

this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('gFindBar', function() { return window.gFindBar; });
this.__defineGetter__('toggleAddonBar', function() { return window.toggleAddonBar; });
this.__defineSetter__('toggleAddonBar', function(v) { return window.toggleAddonBar = v; });
this.__defineGetter__('setToolbarVisibility', function() { return window.setToolbarVisibility; });
this.__defineGetter__('customizeMenu', function() { return $('customization-toolbar-menu'); });
this.__defineGetter__('viewMenu', function() { return $('viewToolbarsMenu').firstChild; });
this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });
this.getComputedStyle = function(el) { return window.getComputedStyle(el); };

/* This only returns non-null when inURLBar is true */
this.__defineGetter__('URLBarContainer', function() { return $(objName+'-urlbar-addonbar-container'); });
/* Likewise for corner */
this.__defineGetter__('cornerContainer', function() { return $(objName+'-corner-container'); });

this.CLIPBAR = 6; // ammount of pixels to clip the bar to when it is closed or hidden

this.moveOnHidingAttr = null;

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
		
		scrollDiv.remove();
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
	setAttribute(contextMenu.getElementsByAttribute('toolbarId', objName+'-addon-bar')[0], 'command', objName+':ToggleAddonBar');
};

this.setViewMenu = function(e) {
	setAttribute(viewMenu.getElementsByAttribute('toolbarId', objName+'-addon-bar')[0], 'command', objName+':ToggleAddonBar');
};

this.setCustomizeMenu = function(e) {
	setAttribute(customizeMenu.getElementsByAttribute('toolbarId', objName+'-addon-bar')[0], 'command', objName+':ToggleAddonBar');
};

this.tabSelectMoveAddonBar = function() {
	var findbar = !(window.gFindBarInitialized && !gFindBar.hidden && gFindBar.getAttribute('position') != 'top' && !trueAttribute(gFindBar, 'movetotop'));
	if(moveBarStyle && moveBarStyle.findbarHidden != findbar) {
		delayMoveAddonBar();
	}
};

this.delayMoveAddonBar = function() {
	timerAid.init('delayMoveAddonBar', moveAddonBar, 0);
};

this.moveAddonBar = function() {
	// there's no point in doing all this in customize mode
	if(customizing) { return; }
	
	// We should do all these calculations to also position the puzzle pieces, even if the add-on bar is closed
	moveBarStyle = {
		findbarHidden: true,
		maxWidth: -(scrollBarWidth *2),
		left: 2,
		right: 2,
		bottom: 0
	};
	
	if(prefAid.placement == 'corner') {
		moveBarStyle.left = scrollBarWidth;
		moveBarStyle.right = scrollBarWidth;
		
		var appContentPos = $('content').getBoundingClientRect();
		moveBarStyle.maxWidth += appContentPos.width;
		moveBarStyle.bottom += document.documentElement.clientHeight -appContentPos.bottom;
		moveBarStyle.left += appContentPos.left;
		moveBarStyle.right += document.documentElement.clientWidth -appContentPos.right;
		
		// Compatibility with TreeStyleTab
		var TabsToolbar = $('TabsToolbar');
		if(TabsToolbar && !TabsToolbar.collapsed
		&& (TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left' || TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right')) {
			var TabsSplitter = document.getAnonymousElementByAttribute($('content'), 'class', 'treestyletab-splitter');
			moveBarStyle.maxWidth -= TabsToolbar.clientWidth;
			moveBarStyle.maxWidth -= TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			if(!prefAid.movetoRight && TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'left') {
				moveBarStyle.left += TabsToolbar.clientWidth;
				moveBarStyle.left += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
			if(prefAid.movetoRight && TabsToolbar.getAttribute('treestyletab-tabbar-position') == 'right') {
				moveBarStyle.right += TabsToolbar.clientWidth;
				moveBarStyle.right += TabsSplitter.clientWidth +(TabsSplitter.clientLeft *2);
			}
		}
		
		// Firefox 25 introduced per-tab findbars. The findbar is now a part of appcontent, so we have to account for its height as well
		if(window.gFindBarInitialized
		&& !gFindBar.hidden
		&& gFindBar.getAttribute('position') != 'top'
		&& !trueAttribute(gFindBar, 'movetotop')) {
			moveBarStyle.findbarHidden = false;
			moveBarStyle.bottom += gFindBar.clientHeight +gFindBar.clientTop;
		}
	}
	
	moveBarStyle.clientHeight = (cornerContainer) ? cornerContainer.clientHeight : addonBar.clientHeight;
	moveBarStyle.clientTop = (cornerContainer) ? cornerContainer.clientTop : addonBar.clientTop;
	moveBarStyle.movetoRight = prefAid.movetoRight;
	
	var addonBarStyle = getComputedStyle(addonBar);
	moveBarStyle.clientBottom = parseInt(addonBarStyle.getPropertyValue('border-bottom-width'));
	
	// Let's account for the transparent bottom border as well if it exists
	moveBarStyle.bottom -= moveBarStyle.clientBottom;
	
	// Account for the puzzle piece
	moveBarStyle.left += 12;
	moveBarStyle.right += 12;
	
	// Let's try to show it like it's poping up from somewhere when there's something below it
	if(moveBarStyle.bottom > 1) { moveBarStyle.bottom--; }
	
	dispatch(addonBar, { type: "WillMoveAddonBar", cancelable: false });
	
	var barOffset = (cornerContainer) ? cornerContainer.clientHeight +cornerContainer.clientTop -CLIPBAR : 0;
	var clipOffHeight = moveBarStyle.clientHeight +moveBarStyle.clientTop;
	if(moveBarStyle.bottom > 1) { clipOffHeight += moveBarStyle.clientBottom; }
	
	// I find it easier to always just move the add-on bar when this is called, instead of checking every occasion when it isn't visible and should still be moved
	//if(addonBar.collapsed) { return; }
	
	styleAid.unload('positionAddonBar_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-container {\n';
	sscode += '		bottom: '+moveBarStyle.bottom+'px;\n';
	sscode += (!prefAid.movetoRight) ? '		left: '+moveBarStyle.left+'px;\n' : '		right: '+moveBarStyle.right+'px;\n';
	sscode += '		max-width: '+Math.max(moveBarStyle.maxWidth, 5)+'px;\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-container:not([autohide]) {\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+clipOffHeight+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-container[collapsed="true"] {\n';
	sscode += '		bottom: '+(moveBarStyle.bottom -barOffset)+'px;\n';
	sscode += '		clip: rect(0px, '+4000+'px, '+CLIPBAR+'px, 0px);\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('positionAddonBar_'+_UUID, sscode, true);
	
	findPersonaPosition();
	
	dispatch(addonBar, { type: "AddonBarMoved", cancelable: false });
	
	reMoveBar();
};

this.reMoveBar = function() {
	var lastSize = {
		height: addonBar.clientHeight +(addonBar.clientTop *2),
		width: addonBar.clientWidth +(addonBar.clientLeft *2)
	};
	timerAid.init('reMoveBar', function() {
		if(typeof(moveAddonBar) != 'undefined' && !UNLOADED) {
			if(lastSize.width != addonBar.clientWidth +(addonBar.clientLeft *2) || lastSize.height != addonBar.clientHeight +(addonBar.clientTop *2)) {
				moveAddonBar();
			}
		}
	}, 500);
};

this.personaChanged = function() {
	aSync(findPersonaPosition);
};

this.findPersonaPosition = function() {
	// Australis isn't really built for the lw-theme footer, plus it might go away someday.
	// despite this, I'm keeping it for now, no harm in it after all, and looks nice for personas that still use the footer image.
	
	if(!trueAttribute(bottomBox, 'lwthemefooter')) {
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
	styleAid.unload('personaAddonBar_'+_UUID);
	
	if(prefAid.lwthemebgImage != '') {
		var boxStyle = getComputedStyle(bottomBox);
		
		if(!prefAid.movetoRight) {
			var offsetPersonaX = -moveBarStyle.left -addonBar.clientLeft +parseInt(boxStyle.getPropertyValue('border-left-width'));
		} else {
			var offsetPersonaX =
				-bottomBox.clientWidth
				+moveBarStyle.right
				+addonBar.clientWidth
				+addonBar.clientLeft
				-parseInt(boxStyle.getPropertyValue('border-left-width'));
		}
		
		var offsetPersonaY =
			-prefAid.lwthemebgHeight
			+moveBarStyle.clientHeight
			+moveBarStyle.bottom
			+moveBarStyle.clientTop
			-parseInt(boxStyle.getPropertyValue('border-bottom-width'));
		if(moveBarStyle.bottom > 1) { offsetPersonaY--; }
		
		var offsetPadding = boxStyle.getPropertyValue('background-position');
		if(offsetPadding.indexOf(' ') > -1 && offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1) > -1) {
			offsetPersonaY += parseInt(offsetPadding.substr(offsetPadding.indexOf(' ') +1, offsetPadding.indexOf('px', offsetPadding.indexOf(' ') +1)));
		}
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #'+objName+'-corner-container {\n';
		sscode += '	  background-image: ' + prefAid.lwthemebgImage + ' !important;\n';
		sscode += '	  background-color: ' + prefAid.lwthemebgColor + ' !important;\n';
		sscode += '	  color: ' + prefAid.lwthemecolor + ' !important;\n';
		sscode += '	  background-position: ' + offsetPersonaX + 'px ' +offsetPersonaY+ 'px !important;\n';
		sscode += '	  background-repeat: repeat !important;\n';
		sscode += '	  background-size: auto auto !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		styleAid.load('personaAddonBar_'+_UUID, sscode, true);
	}
};

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'addonBar', null,
		function(aWindow) {
			aSync(function() { addonBar.hidden = false; }); // aSync works best
			dispatch(aWindow, { type: "loadedAddonBarOverlay", cancelable: false });
		},
		function(aWindow) {
			// Prevent things from jumping around on startup
			addonBar.hidden = true;
		}
	);
	
	// the browser had this method pre-australis, I'm keeping the same name in case some add-on needs it for compatibility
	toggleAddonBar = function toggleAddonBar() {
		setToolbarVisibility(addonBar, addonBar.collapsed);
		toggleAttribute(addonBar, 'customizing', !addonBar.collapsed && customizing);
		
		dispatch(addonBar, { type: 'ToggledAddonBar', cancelable: false });
	};
	
	prefAid.listen('movetoRight', moveAddonBar);
	prefAid.listen('placement', moveAddonBar);
	
	listenerAid.add(contextMenu, 'popupshowing', setContextMenu);
	listenerAid.add(viewMenu, 'popupshown', setViewMenu);
	listenerAid.add(customizeMenu, 'popupshown', setCustomizeMenu);
	listenerAid.add(browserPanel, 'resize', delayMoveAddonBar);
	listenerAid.add(addonBar, 'resize', delayMoveAddonBar);
	listenerAid.add(addonBar, 'drop', delayMoveAddonBar);
	listenerAid.add(addonBar, 'load', delayMoveAddonBar);
	listenerAid.add(window, 'aftercustomization', delayMoveAddonBar);
	listenerAid.add(addonBar, 'ToggledAddonBar', moveAddonBar);
	observerAid.add(personaChanged, "lightweight-theme-styling-update");
	listenerAid.add(addonBar, 'AddonBarCustomized', moveAddonBar);
	gBrowser.tabContainer.addEventListener('TabSelect', tabSelectMoveAddonBar);
	
	// moveAddonBar won't fire when setting hidden/collapsed in the buttons, unless we make it follow these changes
	moveOnHidingAttr = new window.MutationObserver(function(mutations) {
		// we don't need to schedule for every difference, we only need to schedule if there is any;
		// even if we somehow schedule when there's no need to, moveAddonbar will bail-out midway if there's no difference in the values
		for(var m of mutations) {
			if(m.oldValue != m.target.getAttribute(m.attributeName)) {
				// the mutation observer already fires on a "delay" after the attr changes take place,
				// so there's no need to further delay on our side
				moveAddonBar();
				return;
			}
		}
	});
	moveOnHidingAttr.observe(addonBar, {
		attributes: true,
		subtree: true,
		attributeFilter: ['hidden', 'collapsed'],
		attributeOldValue: true
	});
	
	// Half fix for when the status-bar is changed
	listenerAid.add(statusBar, 'load', delayMoveAddonBar, true);
	
	moveAddonBar();
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('positionAddonBar_'+_UUID);
	styleAid.unload('personaAddonBar_'+_UUID);
	
	moveOnHidingAttr.disconnect();
	
	gBrowser.tabContainer.removeEventListener('TabSelect', tabSelectMoveAddonBar);
	listenerAid.remove(addonBar, 'AddonBarCustomized', moveAddonBar);
	observerAid.remove(personaChanged, "lightweight-theme-styling-update");
	listenerAid.remove(contextMenu, 'popupshowing', setContextMenu);
	listenerAid.remove(viewMenu, 'popupshown', setViewMenu);
	listenerAid.remove(customizeMenu, 'popupshown', setCustomizeMenu);
	listenerAid.remove(browserPanel, 'resize', delayMoveAddonBar);
	listenerAid.remove(addonBar, 'resize', delayMoveAddonBar);
	listenerAid.remove(addonBar, 'drop', delayMoveAddonBar);
	listenerAid.remove(addonBar, 'load', delayMoveAddonBar);
	listenerAid.remove(window, 'aftercustomization', delayMoveAddonBar);
	listenerAid.remove(addonBar, 'ToggledAddonBar', moveAddonBar);
	listenerAid.remove(statusBar, 'load', delayMoveAddonBar, true);
	
	prefAid.unlisten('movetoRight', moveAddonBar);
	prefAid.unlisten('placement', moveAddonBar);
	
	removeAttribute(contextMenu.getElementsByAttribute('toolbarId', objName+'-addon-bar')[0], 'command');
	removeAttribute(viewMenu.getElementsByAttribute('toolbarId', objName+'-addon-bar')[0], 'command');
	
	delete window.toggleAddonBar;
	
	overlayAid.removeOverlayWindow(window, 'addonBar');
	addonBar.hidden = false;
};
