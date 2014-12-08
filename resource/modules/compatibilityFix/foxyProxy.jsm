Modules.VERSION = '1.0.0';

// in Firefox 29 and above FoxyProxy should use the CustomizableUI module to track our icon,
// I'm implementing this here until the developer fixes it on FoxyProxy's side (as it will likely affect other toolbars as well)
// see http://forums.getfoxyproxy.org/viewtopic.php?f=4&t=1142

this.__defineGetter__('foxyproxy', function() { return window.foxyproxy; });

this.foxyProxyListener = {
	handler: function() {
		foxyproxy.svgIcons.init();
		if($("fp-toolbar-icon-3")) {
			foxyproxy.setMode(foxyproxy.fp.mode);
		}
	},
	onWidgetAdded: function(aWidgetId) {
		if(aWidgetId == 'foxyproxy-toolbar-icon') {
			this.handler();
		}
	},
	onWidgetRemoved: function(aWidgetId) {
		if(aWidgetId == 'foxyproxy-toolbar-icon') {
			this.handler();
		}
	},
	onAreaNodeRegistered: function() {
		this.handler();
	},
	onAreaNodeUnregstered: function() {
		this.handler();
	}
};

Modules.LOADMODULE = function() {
	CustomizableUI.addListener(foxyProxyListener);
};

Modules.UNLOADMODULE = function() {
	CustomizableUI.removeListener(foxyProxyListener);
};
