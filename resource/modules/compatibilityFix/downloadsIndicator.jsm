Modules.VERSION = '2.0.0';

this.__defineGetter__('DownloadsIndicatorView', function() { return window.DownloadsIndicatorView; });
this.__defineGetter__('DownloadsCommon', function() { return window.DownloadsCommon; });

this.downloadsIndicator = {
	notification: null,
	
	handleEvent: function(e) {
		switch(e.type) {
			case 'popupshowing':
				if(e.target.id == 'downloadsPanel') {
					Listeners.remove(window, 'popupshowing', this);
					Listeners.add(e.target, 'AskingForNodeOwner', this);
				}
				break;
			
			case 'AskingForNodeOwner':
				e.detail = 'downloads-button';
				e.stopPropagation();
				break;
			
			case 'FinishedSlimChromeWidth':
				if(this.notification) {
					DownloadsIndicatorView._showEventNotification(this.notification);
					this.notification = null;
				}
				break;
		}
	}
};

Modules.LOADMODULE = function() {
	Piggyback.add('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification', function(aType) {
		// we're already opening to animate, so don't animate again, just replace the previous animation type
		if(downloadsIndicator.notification) {
			downloadsIndicator.notification = aType;
			return false;
		}
		
		// only pause animation if the button is in our toolbars
		for(let bar of bars) {
			if(this._initialized && DownloadsCommon.animateNotifications
			&& (isAncestor($('downloads-button'), bar) || isAncestor($('downloads-button'), bar._overflowTarget))) {
				// if toolbar is hidden, pause until it is shown
				if(!trueAttribute(bar, 'hover')) {
					downloadsIndicator.notification = aType;
					autoHide.initialShow(bar);
					return false;
				}
				
				// toolbar is not hidden, so keep showing it until animation is done at least
				autoHide.initialShow(bar);
			}
		}
		
		return true;
	}, Piggyback.MODE_BEFORE);
	
	// the downloadsPanel is only created when first called
	if($('downloadsPanel')) {
		Listeners.add($('downloadsPanel'), 'AskingForNodeOwner', downloadsIndicator);
	} else {
		Listeners.add(window, 'popupshowing', downloadsIndicator);
	}
	
	Listeners.add(window, 'FinishedSlimChromeWidth', downloadsIndicator);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'FinishedSlimChromeWidth', downloadsIndicator);
	Listeners.remove($('downloadsPanel'), 'AskingForNodeOwner', downloadsIndicator);
	Listeners.remove(window, 'popupshowing', downloadsIndicator);
	
	Piggyback.revert('downloadsIndicator', DownloadsIndicatorView, 'showEventNotification');
};
