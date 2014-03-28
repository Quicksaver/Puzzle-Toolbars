moduleAid.VERSION = '1.1.4';

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
	
	var sBar = aWindow.document.getElementById('status-bar') || aWindow[objName]._statusBar.node;
	var sStack = aWindow.document.getElementById(objName+'-status-bar-stack');
	if(sBar.parentNode == sStack) { return; }
	
	if(!aWindow[objName]._statusBar) {
		aWindow[objName]._statusBar = {
			node: sBar,
			originalParent: sBar.parentNode
		};
	}
	
	setAttribute(sBar, 'removable', 'true');
	CustomizableUI.removeWidgetFromArea('status-bar');
	sStack.insertBefore(sBar, sStack.firstChild);
};

this.moveStatusBarBack = function(aWindow) {
	if(aWindow[objName]) {
		var sBar = aWindow.document.getElementById('status-bar') || aWindow[objName]._statusBar.node;
		if(aWindow[objName]._statusBar.originalParent) {
			if(aWindow[objName]._statusBar.originalParent != sBar.parentNode) { aWindow[objName]._statusBar.originalParent.appendChild(sBar); }
		}
		else { aWindow.document.getElementById('addon-bar').appendChild(sBar); }
		setAttribute(sBar, 'removable', 'false');
	}
};

// see https://bugzilla.mozilla.org/show_bug.cgi?id=989338
this.preventLosingCustomizeData = function() {
	windowMediator.callOnAll(function(aWindow) {
		moveStatusBarBack(aWindow);
	}, 'navigator:browser');
	try { CustomizableUI.addWidgetToArea('status-bar', 'addon-bar'); } catch(ex) {}
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
	
	alwaysRunOnShutdown.push(preventLosingCustomizeData);
	
	overlayAid.overlayURI('chrome://'+objPathString+'/content/options.xul', 'optionsAustralis');
	overlayAid.overlayURI('chrome://browser/content/browser.xul', 'australisBar', null,
		function(aWindow) {
			moduleAid.load('compatibilityFix/sandboxFixes'); // We need our add-on bar registered for this
			
			prepareObject(window);
			
			moveStatusBar(aWindow);
			listenOnce(aWindow, 'unload', trackStatusBar);
			
			window[objName].moduleAid.load('australis', true);
		},
		function(aWindow) {
			moveStatusBarBack(aWindow);
			
			delete aWindow[objName]._statusBar;
			removeObject(aWindow);
		}
	);
};

moduleAid.UNLOADMODULE = function() {
	moduleAid.unload('compatibilityFix/sandboxFixes');
	
	overlayAid.removeOverlayURI('chrome://browser/content/browser.xul', 'australisBar');
	overlayAid.removeOverlayURI('chrome://'+objPathString+'/content/options.xul', 'optionsAustralis');
	
	preventLosingCustomizeData();
	
	CustomizableUI.removeListener(trackSpecialWidgets);
};
