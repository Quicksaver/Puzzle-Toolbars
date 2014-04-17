moduleAid.VERSION = '1.0.0';

this.__defineGetter__('UIEnhancer', function() { return $('UIEnhancer_URLBar'); });

this.UIEnhancerFixer = function(aEnabled) {
	if(aEnabled) {
		listenerAid.add(addonBar, 'HoverAddonBar', fixUIEnhancerWidth);
		listenerAid.add(addonBar, 'ToggledAddonBar', fixUIEnhancerWidth);
		listenerAid.add(UIEnhancer, 'transitionend', UIEnhancerTransitionEnd);
		fixUIEnhancerWidth();
	} else {
		listenerAid.remove(addonBar, 'HoverAddonBar', fixUIEnhancerWidth);
		listenerAid.remove(addonBar, 'ToggledAddonBar', fixUIEnhancerWidth);
		listenerAid.remove(UIEnhancer, 'transitionend', UIEnhancerTransitionEnd);
		styleAid.unload('UIEnhancer_'+_UUID);
		removeAttribute(UIEnhancer, 'hover');
		removeAttribute(UIEnhancer, 'noAnimation');
	}
};

this.fixUIEnhancerWidth = function() {
	var hover = !addonBar.collapsed && (!prefAid.autoHide || trueAttribute(addonBar, 'hover'));
	if(hover == trueAttribute(UIEnhancer, 'hover')) { return; }
	
	removeAttribute(UIEnhancer, 'noAnimation');
	styleAid.unload('UIEnhancer_'+_UUID);
	toggleAttribute(UIEnhancer, 'hover', hover);
	
	// if the size of the add-on bar is above the available space to it, resize the UIEnhancer box
	if(hover && addonBar.clientWidth > $('urlbar').inputField.clientWidth) {
		var newWidth = parseInt(UIEnhancer.style.width) -addonBar.clientWidth +$('urlbar').inputField.clientWidth;
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #UIEnhancer_URLBar {\n';
		sscode += '		width: '+newWidth+'px !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		styleAid.load('UIEnhancer_'+_UUID, sscode, true);
	}
};

this.UIEnhancerTransitionEnd = function(e) {
	if(e.target != UIEnhancer || e.propertyName != 'width') { return; }
	setAttribute(UIEnhancer, 'noAnimation', 'true');
};

this.UIEnhancerListener = {
	onEnabled: function(addon) {
		if(addon.id == 'UIEnhancer@girishsharma') { UIEnhancerFixer(true); }
	},
	onDisabled: function(addon) {
		if(addon.id == 'UIEnhancer@girishsharma') { UIEnhancerFixer(false); }
	}
};

this.toggleUIEnhancerListener = function(unloaded) {
	if(!UNLOADED && !unloaded && prefAid.placement == 'urlbar') {
		AddonManager.addAddonListener(UIEnhancerListener);
		AddonManager.getAddonByID('UIEnhancer@girishsharma', function(addon) {
			if(addon && addon.isActive) { UIEnhancerFixer(true); }
		});
	} else {
		AddonManager.removeAddonListener(UIEnhancerListener);
		UIEnhancerFixer(false);
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.listen('placement', toggleUIEnhancerListener);
	
	toggleUIEnhancerListener();
};

moduleAid.UNLOADMODULE = function() {
	toggleUIEnhancerListener(true);
	
	prefAid.unlisten('placement', toggleUIEnhancerListener);
};
