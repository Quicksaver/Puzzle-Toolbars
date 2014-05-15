moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'inCorner', null, moveAddonBar);
	if(!Australis) {
		overlayAid.overlayWindow(window, 'cornerLegacy');
	}
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'cornerLegacy');
	overlayAid.removeOverlayWindow(window, 'inCorner');
};
