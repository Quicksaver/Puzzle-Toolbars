moduleAid.VERSION = '1.0.1';

moduleAid.LOADMODULE = function() {
	overlayAid.overlayWindow(window, 'inCorner', null, moveAddonBar);
};

moduleAid.UNLOADMODULE = function() {
	overlayAid.removeOverlayWindow(window, 'inCorner');
};
