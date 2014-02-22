moduleAid.VERSION = '1.2.0';

this.trackCTRBar = {
	onWidgetAdded: function(aId, aCurrentArea) {
		if(aCurrentArea == 'ctr_addon-bar') {
			CustomizableUI.addWidgetToArea(aId, objName+'-addon-bar');
		}
	}
};

moduleAid.LOADMODULE = function() {
	styleAid.load('ctr', 'ctr');
	
	var ids = CustomizableUI.getWidgetIdsInArea('ctr_addon-bar');
	
	// ignore CTR's closebutton and replace with normal special widgets
	var i = 0;
	while(i < ids.length) {
		if(ids[i].startsWith('ctr_')) {
			if(ids[i] == 'ctr_addonbar-close') {
				ids.splice(i, 1);
				continue;
			}
			
			if(ids[i] == 'status-bar') {
				ids.splice(i, 1);
				continue;
			}
		}
		i++;
	}
	
	for(var i=0; i<ids.length; i++) {
		CustomizableUI.addWidgetToArea(ids[i], objName+'-addon-bar');
	}
	
	// I don't unregister CTR's add-on bar, instead I just watch for any widgets added to it and migrate them automatically
	CustomizableUI.addListener(trackCTRBar);
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('ctr');
	
	CustomizableUI.removeListener(trackCTRBar);
	
	// If the user is disabling or uninstalling the add-on, we might as well move our widgets back into CTR's bar, for a seamless experience
	if(UNLOADED == ADDON_DISABLE && CustomizableUI.getAreaType(objName+'-addon-bar')) {
		var ids = CustomizableUI.getWidgetIdsInArea(objName+'-addon-bar');
		
		for(var i=0; i<ids.length; i++) {
			CustomizableUI.addWidgetToArea(ids[i], 'ctr_addon-bar');
		}
	}
};
