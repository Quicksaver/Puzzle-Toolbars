moduleAid.VERSION = '1.0.0';

this.__defineGetter__('BookmarkingUI', function() { return window.BookmarkingUI; });

this.bookmarkedItemWaitToLoad = function(aArea) {
	if(!$(aArea)) {
		timerAid.init('bookmarkedItemWaitToLoad', function() {
			if(typeof(bookmarkedItemWaitToLoad) == 'undefined') { return; }
			
			bookmarkedItemWaitToLoad(aArea);
		}, 250);
		return;
	}
	
	BookmarkingUI._onWidgetWasMoved();
};

this.bookmarkedItemListener = {
	onAreaNodeRegistered: function(aArea) {
		if(possibleBars.indexOf(aArea) == -1) { return; }
		
		var placement = CustomizableUI.getPlacementOfWidget(BookmarkingUI.BOOKMARK_BUTTON_ID);
		if(!placement || placement.area != aArea) { return; }
		
		bookmarkedItemWaitToLoad(aArea);
	}
};

moduleAid.LOADMODULE = function() {
	CustomizableUI.addListener(bookmarkedItemListener);
};

moduleAid.UNLOADMODULE = function() {
	CustomizableUI.removeListener(bookmarkedItemListener);
};
