moduleAid.VERSION = '1.1.0';

this.TMPtoggledBottom = function() {
	if(prefAid.tabBarPosition == 1) {
		overlayAid.overlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
	} else {
		overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
	}
};

moduleAid.LOADMODULE = function() {
	prefAid.setDefaults({ tabBarPosition: 0 }, 'tabmix');
	prefAid.listen('tabBarPosition', TMPtoggledBottom);
	
	TMPtoggledBottom();
};

moduleAid.UNLOADMODULE = function() {
	prefAid.unlisten('tabBarPosition', TMPtoggledBottom);
	overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
};
