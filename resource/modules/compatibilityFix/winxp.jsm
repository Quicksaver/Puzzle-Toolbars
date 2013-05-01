moduleAid.VERSION = '1.0.0';

moduleAid.LOADMODULE = function() {
	setAttribute($('main-window'), objName+'-oscpu', 'Windows NT 5.1');
};

moduleAid.UNLOADMODULE = function() {
	removeAttribute($('main-window'), objName+'-oscpu', 'Windows NT 5.1');
};
