moduleAid.VERSION = '1.0.0';

this.__defineGetter__('menuPopup', function() { return $('addonBarKeyset-menupopup'); });

this.isStillAvailable = function(key, list) {
	if(key.keycode != 'none' && !list[key.keycode]) { return false; }
	
	return true;
};

this.fillKeycodes = function() {
	var addonBarKey = {
		keycode: $('addonBarKeyset-menu').value,
		accel: $('accelCheckbox').checked,
		shift: $('shiftCheckbox').checked,
		alt: $('altCheckbox').checked
	};
	
	var available = keysetAid.getAvailable(addonBarKey, true);
	if(!isStillAvailable(addonBarKey, available)) {
		addonBarKey.keycode = 'none';
	}
	
	var item = menuPopup.firstChild.nextSibling;
	while(item) {
		item.setAttribute('hidden', 'true');
		item.setAttribute('disabled', 'true');
		item = item.nextSibling;
	}
	if(addonBarKey.keycode == 'none') {
		menuPopup.parentNode.selectedItem = menuPopup.firstChild;
		$(menuPopup.parentNode.getAttribute('preference')).value = 'none';
	}
	
	for(var i=1; i<menuPopup.childNodes.length; i++) {
		var item = menuPopup.childNodes[i];
		var keycode = item.getAttribute('value');
		if(!available[keycode]) {
			continue;
		}
		
		item.removeAttribute('hidden');
		item.removeAttribute('disabled');
		if(keycode == addonBarKey.keycode) {
			menuPopup.parentNode.selectedItem = item;
			// It has the annoying habit of re-selecting the first (none) entry when selecting a menuitem with '*' as value
			if(keycode == '*') {
				var itemIndex = menuPopup.parentNode.selectedIndex;
				aSync(function() { menuPopup.parentNode.selectedIndex = itemIndex; });
			}
		}
	}
};

moduleAid.LOADMODULE = function() {
	if(Services.appinfo.OS == 'Darwin') {
		overlayAid.overlayWindow(window, 'optionsMac');
	}
	
	fillKeycodes();
	fillVersion($('addonVersion'));
};
