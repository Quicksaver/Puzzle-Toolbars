// VERSION 2.0.3

/* I'm actually not sure if any of this is working, UIEnhancer seems to be having some problems in Nightly... */

this.UIEnhancer = {
	id: 'UIEnhancer@girishsharma',
	
	get urlbarEnhancer () { return $('UIEnhancer_URLBar'); },
	
	handleEvent: function(e) {
		if(UNLOADED) {
			if(typeof(urlbar) != 'undefined') {
				this.unlisten();
			}
			return;
		}
		
		switch(e.type) {
			case 'LoadedPuzzleBar':
				if(typeof(urlbar) != 'undefined' && urlbar.bar == e.target) {
					this.listen();
				}
				break;
				
			case 'UnloadedPuzzleBar':
				if(typeof(urlbar) != 'undefined' && urlbar.bar == e.target) {
					this.unlisten();
				}
				break;
			
			case 'HoverPuzzleBar':
			case 'ToggledPuzzleBar':
			case 'resize':
				this.fixWidth();
				break;
			
			case 'transitionend':
				if(e.target != this.urlbarEnhancer || e.propertyName != 'width') { return; }
				setAttribute(this.urlbarEnhancer, 'noAnimation', 'true');
				break;
		}
	},
	
	onEnabled: function(addon) {
		if(addon.id == this.id) { this.enable(); }
	},
	
	onDisabled: function(addon) {
		if(addon.id == this.id) { this.disable(); }
	},
	
	listen: function() {
		AddonManager.addAddonListener(this);
		AddonManager.getAddonByID(this.id, (addon) => {
			if(addon && addon.isActive) { this.enable(); }
		});
	},
	
	unlisten: function() {
		AddonManager.removeAddonListener(this);
		this.disable();
	},
	
	enable: function() {
		Listeners.add(urlbar.bar, 'HoverPuzzleBar', this);
		Listeners.add(urlbar.bar, 'ToggledPuzzleBar', this);
		Listeners.add(window, 'resize', this);
		Listeners.add(this.urlbarEnhancer, 'transitionend', this);
		
		setAttribute($('urlbar'), objName+'-UIEnhancer', 'true');
		this.fixWidth();
	},
	
	disable: function() {
		Listeners.remove(urlbar.bar, 'HoverPuzzleBar', this);
		Listeners.remove(urlbar.bar, 'ToggledPuzzleBar', this);
		Listeners.remove(window, 'resize', this);
		Listeners.remove(this.urlbarEnhancer, 'transitionend', this);
		
		removeAttribute($('urlbar'), objName+'-UIEnhancer');
		Styles.unload('UIEnhancer_'+_UUID);
		removeAttribute(this.urlbarEnhancer, 'hover');
		removeAttribute(this.urlbarEnhancer, 'noAnimation');
	},
	
	fixWidth: function() {
		var hover = !urlbar.bar.collapsed && (!Prefs.urlbar_autohide || trueAttribute(urlbar.bar, 'hover'));
		
		if(hover != trueAttribute(this.urlbarEnhancer, 'hover')) {
			removeAttribute(this.urlbarEnhancer, 'noAnimation');
			Styles.unload('UIEnhancer_'+_UUID);
		}
		
		toggleAttribute(this.urlbarEnhancer, 'hover', hover);
		
		// if the size of the add-on bar is above the available space to it, resize the UIEnhancer box
		if(hover && urlbar.bar.clientWidth > $('urlbar').inputField.clientWidth) {
			var newWidth = parseInt(this.urlbarEnhancer.style.width) -urlbar.bar.clientWidth +$('urlbar').inputField.clientWidth;
			
			let sscode = '\
				@namespace url(http://www.mozilla.org/keymaster/gatekeeper/there.is.only.xul);\n\
				@-moz-document url("'+document.baseURI+'") {\n\
					window['+objName+'_UUID="'+_UUID+'"] #UIEnhancer_URLBar {\n\
						width: '+newWidth+'px !important;\n\
					}\n\
				}';
			
			Styles.load('UIEnhancer_'+_UUID, sscode, true);
		}
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'LoadedPuzzleBar', UIEnhancer);
	Listeners.add(window, 'UnloadedPuzzleBar', UIEnhancer);
	
	if(Prefs.urlbar_bar && typeof(urlbar) != 'undefined' && urlbar.bar) {
		UIEnhancer.listen();
	}
};

Modules.UNLOADMODULE = function() {
	if(Prefs.urlbar_bar && typeof(urlbar) != 'undefined' && urlbar.bar) {
		UIEnhancer.unlisten();
	}
	
	Listeners.remove(window, 'LoadedPuzzleBar', UIEnhancer);
	Listeners.remove(window, 'UnloadedPuzzleBar', UIEnhancer);
};
