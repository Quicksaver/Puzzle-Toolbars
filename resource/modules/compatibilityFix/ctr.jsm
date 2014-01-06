moduleAid.VERSION = '1.0.2';

this.__defineGetter__('ctrBar', function() { return $('ctr_addon-bar'); });

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
		
		// see note in overlayAid.runRegisterToolbar()
		if(!ctrBar._init) {
			overlayAid.tempAppendToolbar(window, ctrBar);
		}
		CustomizableUI.unregisterArea('ctr_addon-bar');
		if(overlayAid.tempAppend) {
			overlayAid.tempRestoreToolbar();
		}
	}
};

moduleAid.UNLOADMODULE = function() {
	if(UNLOADED) {
		styleAid.unload('ctr');
		
		CustomizableUI.registerArea('ctr_addon-bar');
		
		// see note in overlayAid.runRegisterToolbar()
		if(!ctrBar._init) {
			overlayAid.tempAppendToolbar(window, ctrBar);
		}
		ctrBar._init();
		if(overlayAid.tempAppend) {
			overlayAid.tempRestoreToolbar();
		}
		
		// If the user is disabling or uninstalling the add-on, we might as well move our widgets back into CTR's bar, for a seamless experience
		if(UNLOADED == ADDON_DISABLE && CustomizableUI.getAreaType(objName+'-addon-bar')) {
			var ids = CustomizableUI.getWidgetIdsInArea(objName+'-addon-bar');
			
			for(var i=0; i<ids.length; i++) {
				CustomizableUI.addWidgetToArea(ids[i], 'ctr_addon-bar');
			}
		}
	}
};
