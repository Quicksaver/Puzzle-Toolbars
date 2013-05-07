moduleAid.VERSION = '1.1.3';

this.__defineGetter__('addonBar', function() { return $('addon-bar'); });
this.__defineGetter__('browserPanel', function() { return $('browser-panel'); });
this.__defineGetter__('toggleAddonBar', function() { return window.toggleAddonBar; });
this.__defineSetter__('toggleAddonBar', function(v) { return window.toggleAddonBar = v; });
this.__defineGetter__('setToolbarVisibility', function() { return window.setToolbarVisibility; });
this.__defineGetter__('contextMenu', function() { return $('toolbar-context-menu'); });
this.__defineGetter__('contextOptions', function() { return $(objName+'-contextOptions'); });
this.__defineGetter__('contextSeparator', function() { return $(objName+'-contextSeparator'); });

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

this.moveBarStyle = {};
this.lastBarStyle = null;
this.shouldReMoveBar = function(newStyle) {
	if(!lastBarStyle) { return true; }
	
	if(newStyle.bottom != lastBarStyle.bottom
	|| newStyle.right != lastBarStyle.right
	|| newStyle.left != lastBarStyle.left
	|| newStyle.maxWidth != lastBarStyle.maxWidth
	|| newStyle.movetoRight != lastBarStyle.movetoRight) {
		return true;
	}
	
	return false;
};

this.doOpenOptions = function() {
	openOptions();
};

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
	
	moveBarStyle.movetoRight = prefAid.movetoRight;
	lastBarStyle = moveBarStyle;
	
	dispatch(addonBar, { type: "WillMoveAddonBar", cancelable: false });
	
	// No point in positioning it if it's not visible
	if(addonBar.collapsed) { return; }
	
	styleAid.unload('positionAddonBar_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #addon-bar {\n';
	sscode += '		bottom: '+moveBarStyle.bottom+'px;\n';
	sscode += (!prefAid.movetoRight) ? '		left: '+moveBarStyle.left+'px;\n' : '		right: '+moveBarStyle.right+'px;\n';
	sscode += '		max-width: '+Math.max(moveBarStyle.maxWidth, 5)+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('positionAddonBar_'+_UUID, sscode, true);
	
	dispatch(addonBar, { type: "AddonBarMoved", cancelable: false });
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
	listenerAid.add(browserPanel, 'resize', delayMoveAddonBar);
	listenerAid.add(addonBar, 'ToggledAddonBar', moveAddonBar);
	
	moveAddonBar();
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('positionAddonBar_'+_UUID);
	
	listenerAid.remove(contextMenu, 'popupshown', setContextMenu, false);
	listenerAid.remove(browserPanel, 'resize', delayMoveAddonBar);
	listenerAid.remove(addonBar, 'ToggledAddonBar', moveAddonBar);
	
	prefAid.unlisten('movetoRight', moveAddonBar);
	
	if(this.backups) {
		toggleAddonBar = this.backups.toggleAddonBar;
		delete this.backups;
	}
	
	overlayAid.removeOverlayWindow(window, 'addonBar');
};
