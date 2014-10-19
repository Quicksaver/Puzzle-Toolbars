Modules.VERSION = '1.1.1';

/* I'm actually not sure if any of this is working, UIEnhancer seems to be having some problems in Nightly... */

this.__defineGetter__('UIEnhancer', function() { return $('UIEnhancer_URLBar'); });

this.UIEnhancerFixer = function(aEnabled) {
	if(aEnabled) {
		Listeners.add(urlbarBar, 'HoverAddonBar', fixUIEnhancerWidth);
		Listeners.add(urlbarBar, 'ToggledAddonBar', fixUIEnhancerWidth);
		Listeners.add(UIEnhancer, 'transitionend', UIEnhancerTransitionEnd);
		setAttribute($('urlbar'), objName+'-UIEnhancer', 'true');
		fixUIEnhancerWidth();
	} else {
		Listeners.remove(urlbarBar, 'HoverAddonBar', fixUIEnhancerWidth);
		Listeners.remove(urlbarBar, 'ToggledAddonBar', fixUIEnhancerWidth);
		Listeners.remove(UIEnhancer, 'transitionend', UIEnhancerTransitionEnd);
		removeAttribute($('urlbar'), objName+'-UIEnhancer');
		Styles.unload('UIEnhancer_'+_UUID);
		removeAttribute(UIEnhancer, 'hover');
		removeAttribute(UIEnhancer, 'noAnimation');
	}
};

this.fixUIEnhancerWidth = function() {
	var hover = !urlbarBar.collapsed && (!Prefs.urlbar_autohide || trueAttribute(urlbarBar, 'hover'));
	if(hover == trueAttribute(UIEnhancer, 'hover')) { return; }
	
	removeAttribute(UIEnhancer, 'noAnimation');
	Styles.unload('UIEnhancer_'+_UUID);
	toggleAttribute(UIEnhancer, 'hover', hover);
	
	// if the size of the add-on bar is above the available space to it, resize the UIEnhancer box
	if(hover && urlbarBar.clientWidth > $('urlbar').inputField.clientWidth) {
		var newWidth = parseInt(UIEnhancer.style.width) -urlbarBar.clientWidth +$('urlbar').inputField.clientWidth;
		
		var sscode = '/*The Puzzle Piece CSS declarations of variable values*/\n';
		sscode += '@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n';
		sscode += '@-moz-document url("'+document.baseURI+'") {\n';
		sscode += '	window['+objName+'_UUID="'+_UUID+'"] #UIEnhancer_URLBar {\n';
		sscode += '		width: '+newWidth+'px !important;\n';
		sscode += '	}\n';
		sscode += '}';
		
		Styles.load('UIEnhancer_'+_UUID, sscode, true);
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

this.toggleUIEnhancerListener = function(e) {
	if(typeof(urlbarBar) == 'undefined' || urlbarBar != e.target) { return; }
	
	if(!UNLOADED && (!e.type || e.type == 'LoadedPuzzleBar')) {
		AddonManager.addAddonListener(UIEnhancerListener);
		AddonManager.getAddonByID('UIEnhancer@girishsharma', function(addon) {
			if(addon && addon.isActive) { UIEnhancerFixer(true); }
		});
	} else {
		AddonManager.removeAddonListener(UIEnhancerListener);
		UIEnhancerFixer(false);
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'LoadedPuzzleBar', toggleUIEnhancerListener);
	Listeners.add(window, 'UnloadedPuzzleBar', toggleUIEnhancerListener);
	
	if(Prefs.urlbar_bar && typeof(urlbarBar) != 'undefined' && urlbarBar) {
		toggleUIEnhancerListener({ target: urlbarBar });
	}
};

Modules.UNLOADMODULE = function() {
	if(Prefs.urlbar_bar && typeof(urlbarBar) != 'undefined' && urlbarBar) {
		toggleUIEnhancerListener();
	}
	
	Listeners.remove(window, 'LoadedPuzzleBar', toggleUIEnhancerListener);
	Listeners.remove(window, 'UnloadedPuzzleBar', toggleUIEnhancerListener);
};
