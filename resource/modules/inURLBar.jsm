moduleAid.VERSION = '1.0.0';

this.loadInURLBar = function() {
	URLBarContainer.appendChild(addonBar);
	listenerAid.add(addonBar, 'ToggledAddonBar', openURLBarContainer);
	
	moveAddonBar();
	openURLBarContainer();
	moveContainer();
	autoHideContainer();
	
	if(prefAid.autoHide) {
		initHovers(); // the button would only be added after this had been called, mousing over it wouldn't work
	}
};

this.openURLBarContainer = function() {
	toggleAttribute(URLBarContainer, 'active', !addonBar.collapsed);
};

this.moveContainer = function() {
	styleAid.unload('moveContainer_'+_UUID);
	
	var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
	sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
	sscode += '@-moz-document url("'+document.baseURI+'") {\n';
	sscode += '	window['+objName+'_UUID="'+_UUID+'"] #thePuzzlePiece-urlbar-addonbar-container[active] {\n';
	sscode += '		width: '+addonBar.clientWidth+'px;\n';
	sscode += '	}\n';
	sscode += '}';
	
	styleAid.load('moveContainer_'+_UUID, sscode, true);
};

this.autoHideContainer = function() {
	toggleAttribute(URLBarContainer, 'autohide', prefAid.autoHide);
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('autoHide', autoHideContainer);
	
	listenerAid.add(addonBar, 'AddonBarMoved', moveContainer);
	
	overlayAid.overlayWindow(window, 'inURLBar', null, loadInURLBar);
};

moduleAid.UNLOADMODULE = function() {
	listenerAid.remove(addonBar, 'ToggledAddonBar', openURLBarContainer);
	listenerAid.remove(addonBar, 'AddonBarMoved', moveContainer);
	
	prefAid.unlisten('autoHide', autoHideContainer);
	
	bottomBox.insertBefore(addonBar, leftPP);
	overlayAid.removeOverlayWindow(window, 'inURLBar');
	
	styleAid.unload('moveContainer_'+_UUID);
	
	if(!UNLOADED) {
		moveAddonBar();
	}
};
