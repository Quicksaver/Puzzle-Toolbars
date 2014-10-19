moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	overlayAid.overlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/bottom.xul', 'bottomTMP');
};
