Modules.VERSION = '1.1.5';

this.keys = [
	{
		id: objName+'-bottom-key',
		get disabled () { return trueAttribute($('bottom_keycodeMenu'), 'disabled'); },
		get keycode () { return $('bottom_keycodeMenu').value; },
		get accel () { return $('bottom_accelCheckbox').checked; },
		get shift () { return $('bottom_shiftCheckbox').checked; },
		get alt () { return $('bottom_altCheckbox').checked; },
		get menu () { return $('bottom_keycodeMenupopup'); }
	},
	{
		id: objName+'-corner-key',
		get disabled () { return trueAttribute($('corner_keycodeMenu'), 'disabled'); },
		get keycode () { return $('corner_keycodeMenu').value; },
		get accel () { return $('corner_accelCheckbox').checked; },
		get shift () { return $('corner_shiftCheckbox').checked; },
		get alt () { return $('corner_altCheckbox').checked; },
		get menu () { return $('corner_keycodeMenupopup'); }
	},
	{
		id: objName+'-urlbar-key',
		get disabled () { return trueAttribute($('urlbar_keycodeMenu'), 'disabled'); },
		get keycode () { return $('urlbar_keycodeMenu').value; },
		get accel () { return $('urlbar_accelCheckbox').checked; },
		get shift () { return $('urlbar_shiftCheckbox').checked; },
		get alt () { return $('urlbar_altCheckbox').checked; },
		get menu () { return $('urlbar_keycodeMenupopup'); }
	},
	{
		id: objName+'-lateral-key',
		get disabled () { return trueAttribute($('lateral_keycodeMenu'), 'disabled'); },
		get keycode () { return $('lateral_keycodeMenu').value; },
		get accel () { return $('lateral_accelCheckbox').checked; },
		get shift () { return $('lateral_shiftCheckbox').checked; },
		get alt () { return $('lateral_altCheckbox').checked; },
		get menu () { return $('lateral_keycodeMenupopup'); }
	},
	{
		id: objName+'-top-key',
		get disabled () { return trueAttribute($('top_keycodeMenu'), 'disabled'); },
		get keycode () { return $('top_keycodeMenu').value; },
		get accel () { return $('top_accelCheckbox').checked; },
		get shift () { return $('top_shiftCheckbox').checked; },
		get alt () { return $('top_altCheckbox').checked; },
		get menu () { return $('top_keycodeMenupopup'); }
	}
];

this.fillKeycodes = function() {
	for(var key of keys) {
		var available = Keysets.getAvailable(key, keys);
		if(!isStillAvailable(key, available)) {
			key.keycode = 'none';
		}
		
		var item = key.menu.firstChild.nextSibling;
		while(item) {
			item.setAttribute('hidden', 'true');
			item.setAttribute('disabled', 'true');
			item = item.nextSibling;
		}
		if(key.keycode == 'none') {
			key.menu.parentNode.selectedItem = key.menu.firstChild;
			$(key.menu.parentNode.getAttribute('preference')).value = 'none';
		}
		
		for(var item of key.menu.childNodes) {
			var keycode = item.getAttribute('value');
			if(!available[keycode]) { continue; }
			
			item.removeAttribute('hidden');
			item.removeAttribute('disabled');
			if(keycode == key.keycode) {
				key.menu.parentNode.selectedItem = item;
				// It has the annoying habit of re-selecting the first (none) entry when selecting a menuitem with '*' as value
				if(keycode == '*') {
					var itemIndex = key.menu.parentNode.selectedIndex;
					aSync(function() { key.menu.parentNode.selectedIndex = itemIndex; });
				}
			}
		}
	}
};

this.isStillAvailable = function(key, list) {
	if(!list[key.keycode]) { return false; }
	return true;
};

this.urlbarCheckboxes = function() {
	Timers.init('urlbarCheckboxes', function() {
		var pp = $(objName+'-urlbar-ppCheckbox');
		var autohide = $(objName+'-urlbar-autohideCheckbox');
		var whenfocused = $(objName+'-urlbar-whenfocusedCheckbox');
		
		if(autohide.checked && !pp.checked && !whenfocused.checked) {
			autohide.checked = false;
			autohide.doCommand(); // trigger dependencies
		}
	});
};

this.openReleaseNotesTab = function(aWindow) {
	// this doesn't work in e10s yet
	//aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('about:'+objPathString);
	aWindow.gBrowser.selectedTab = aWindow.gBrowser.addTab('chrome://'+objPathString+'/content/whatsnew.xhtml');
	aWindow.gBrowser.selectedTab.loadOnStartup = true; // for Tab Mix Plus
};

this.openReleaseNotes = function(e) {
	if(e.type == 'click' && e.which != 1) { return; }
	if(e.type == 'keypress' && e.keycode != e.DOM_VK_RETURN) { return; }
	
	if(window.opener && window.opener instanceof window.opener.ChromeWindow) {
		openReleaseNotesTab(window.opener);
	} else {
		Windows.callOnMostRecent(openReleaseNotesTab, 'navigator:browser');
	}
	
	e.preventDefault();
	e.stopPropagation();
};
	
Modules.LOADMODULE = function() {
	if(DARWIN) {
		Overlays.overlayWindow(window, 'optionsMac');
	}
	
	fillKeycodes();
	fillVersion($('addonVersion'));
	
	Listeners.add($('releaseNotesLink'), 'keypress', openReleaseNotes, true);
	Listeners.add($('releaseNotesLink'), 'click', openReleaseNotes, true);
};
