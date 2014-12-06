Modules.VERSION = '1.0.0';

this.__defineGetter__('PlacesToolbarHelper', function() { return window.PlacesToolbarHelper; });

this.bookmarksToolbarListener = {
	// the bookmarks toolbar isn't initialized on startup if it's placed in one of the puzzle bars
	onAreaNodeRegistered: function(aArea) {
		if(possibleBars.indexOf(aArea) > -1) {
			var placement = CustomizableUI.getPlacementOfWidget('personal-bookmarks');
			if(placement && placement.area == aArea) {
				PlacesToolbarHelper.init();
			}
		}
	}
};

Modules.LOADMODULE = function() {
	CustomizableUI.addListener(bookmarksToolbarListener);
};

Modules.UNLOADMODULE = function() {
	CustomizableUI.removeListener(bookmarksToolbarListener);
};
