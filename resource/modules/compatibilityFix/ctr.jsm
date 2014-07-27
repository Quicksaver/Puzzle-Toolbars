moduleAid.VERSION = '1.3.0';

this.ctrId = 'ctraddon_';

this.trackCTRBar = {
	onWidgetAdded: function(aId, aCurrentArea) {
		if(aCurrentArea == ctrId+'addon-bar') {
			CustomizableUI.addWidgetToArea(aId, objName+'-addon-bar');
		}
	}
};

moduleAid.LOADMODULE = function() {
	AddonManager.getAddonByID("ClassicThemeRestorer@ArisT2Noia4dev", function(addon) {
		styleAid.load('ctr', 'ctr');
		
		var ids = CustomizableUI.getWidgetIdsInArea(ctrId+'addon-bar');
		
		// ignore CTR's closebutton and replace with normal special widgets
		var i = 0;
		while(i < ids.length) {
			if(ids[i].startsWith(ctrId)) {
				if(ids[i] == ctrId+'addonbar-close') {
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
		
		for(var i in ids) {
			CustomizableUI.addWidgetToArea(i, objName+'-addon-bar');
		}
		
		// I don't unregister CTR's add-on bar, instead I just watch for any widgets added to it and migrate them automatically
		CustomizableUI.addListener(trackCTRBar);
	});
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('ctr');
	
	CustomizableUI.removeListener(trackCTRBar);
	
	// If the user is disabling or uninstalling the add-on, we might as well move our widgets back into CTR's bar, for a seamless experience
	if(UNLOADED == ADDON_DISABLE && CustomizableUI.getAreaType(objName+'-addon-bar')) {
		var ids = CustomizableUI.getWidgetIdsInArea(objName+'-addon-bar');
		
		for(var i in ids) {
			CustomizableUI.addWidgetToArea(i, ctrId+'addon-bar');
		}
	}
};
