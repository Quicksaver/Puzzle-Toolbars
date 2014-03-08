moduleAid.VERSION = '1.1.3';

this.CustomizableUI = null;

this.specialWidgets = ['separator', 'spring', 'spacer'];

this.trackSpecialWidgets = {
	onWidgetAdded: function(aId, aCurrentArea, aCurrentPosition) {
		if(aId.startsWith(objName+'-special-')) {
			var type = aId.split(objName+'-special-')[1];
			CustomizableUI.removeWidgetFromArea(aId);
			
			if(type != 'spring' || aCurrentArea != 'nav-bar') {
				CustomizableUI.addWidgetToArea(type, aCurrentArea, aCurrentPosition);
			}
			
			// Note: not setting WIDE_PANEL_CLASS to these widgets, in case they are inserted in the menu-panel,
			// so they can be more accuratelly placed.
		}
	}
};

this.trackStatusBar = function() {
	windowMediator.callOnAll(moveStatusBar, 'navigator:browser');
};
	
// move the status bar onto our container
this.moveStatusBar = function(aWindow) {
	if(aWindow.closed || aWindow.willClose) { return; }
	
	var sBar = aWindow.document.getElementById('status-bar') || aWindow._thePuzzlePiece_statusBar;
	var sStack = aWindow.document.getElementById(objName+'-status-bar-stack');
	if(sBar.parentNode == sStack) { return; }
	
	aWindow._thePuzzlePiece_statusBar = sBar;
	if(!sBar._originalParent) { sBar._originalParent = sBar.parentNode; }
	
	setAttribute(sBar, 'removable', 'true');
	CustomizableUI.removeWidgetFromArea('status-bar');
	sStack.insertBefore(sBar, sStack.firstChild);
};

moduleAid.LOADMODULE = function() {
	var scope = {};
	Cu.import("resource:///modules/CustomizableUI.jsm", scope);
	CustomizableUI = scope.CustomizableUI;

	// Make sure our special widgets aren't actually appended anywhere, they are just placeholders
	CustomizableUI.addListener(trackSpecialWidgets);
	
	for(var i=0; i<specialWidgets.length; i++) {
		CustomizableUI.removeWidgetFromArea(objName+'-special-'+specialWidgets[i]);
	}
	
	overlayAid.overlayURI('chrome://'+objPathString+'/content/options.xul', 'optionsAustralis');
	overlayAid.overlayURI('chrome://browser/content/browser.xul', 'australisBar', null,
		function(aWindow) {
			moduleAid.load('compatibilityFix/sandboxFixes'); // We need our add-on bar registered for this
			
			moveStatusBar(aWindow);
			listenOnce(aWindow, 'unload', trackStatusBar);
			
			startAddon(aWindow);
		},
		function(aWindow) {
			stopAddon(aWindow);
			
			var sBar = aWindow.document.getElementById('status-bar') || aWindow._thePuzzlePiece_statusBar;
			if(sBar._originalParent) {
				if(sBar._originalParent != sBar.parentNode) { sBar._originalParent.appendChild(sBar); }
			}
			else { aWindow.document.getElementById('addon-bar').appendChild(sBar); }
			
			setAttribute(sBar, 'removable', 'false');
			
			delete sBar._originalParent;
			delete aWindow._thePuzzlePiece_statusBar;
		}
	);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/sandboxFixes');
	
	overlayAid.removeOverlayURI('chrome://browser/content/browser.xul', 'australisBar');
	overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/options.xul', 'optionsAustralis');
	
	CustomizableUI.removeListener(trackSpecialWidgets);
};
