moduleAid.VERSION = '1.1.0';

moduleAid.LOADMODULE = function() {
	styleAid.load('ctr', 'ctr');
	
	if(CustomizableUI.getAreaType('ctr_addon-bar')) {
		var ids = CustomizableUI.getWidgetIdsInArea('ctr_addon-bar');
		
		// ignore CTR's closebutton and replace with normal special widgets
		var i = 0;
		while(i < ids.length) {
			if(ids[i].startsWith('ctr_')) {
				if(ids[i] == 'ctr_addonbar-close') {
					ids.splice(i, 1);
					continue;
				}
				
				if(ids[i].startsWith('ctr_separator')) {
					ids[i] = 'separator';
				} else if(ids[i].startsWith('ctr_flexible_space')) {
					ids[i] = 'spring';
				} else if(ids[i].startsWith('ctr_space')) {
					ids[i] = 'spacer';
				}
			}
			i++;
		}
		
		for(var i=0; i<ids.length; i++) {
			CustomizableUI.addWidgetToArea(ids[i], objName+'-addon-bar');
		}
		
		// it should always have the binding applied, so I should need to have to move it around like I do in overlayAid
		CustomizableUI.unregisterArea('ctr_addon-bar');
	}
};

moduleAid.UNLOADMODULE = function() {
	styleAid.unload('ctr');
	
	CustomizableUI.registerArea('ctr_addon-bar');
	windowMediator.callOnAll(function(aWindow) {
		var ctrBar = aWindow.document.getElementById('ctr_addon-bar');
		if(ctrBar && ctrBar._init) {
			ctrBar._init();
		}
	}, 'navigator:browser');
	
	// If the user is disabling or uninstalling the add-on, we might as well move our widgets back into CTR's bar, for a seamless experience
	if(UNLOADED == ADDON_DISABLE && CustomizableUI.getAreaType(objName+'-addon-bar')) {
		var ids = CustomizableUI.getWidgetIdsInArea(objName+'-addon-bar');
		
		for(var i=0; i<ids.length; i++) {
			CustomizableUI.addWidgetToArea(ids[i], 'ctr_addon-bar');
		}
	}
};
