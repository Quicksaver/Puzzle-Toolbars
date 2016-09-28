/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 2.0.0

this.TreeStyleTab = {
	handleEvent: function(e) {
		switch(e.type) {
			case 'nsDOMTreeStyleTabTabbarPositionChanged':
			case 'nsDOMTreeStyleTabAutoHideStateChange':
				if(Prefs.corner_bar && typeof(corner) != 'undefined' && corner.bar && !corner.bar.collapsed && !customizing) {
					corner.move();
				}
				break;

			case 'ToggledPuzzleBar':
			case 'LoadedAutoHidePuzzleBar':
			case 'UnloadedAutoHidePuzzleBar':
			case 'LoadedPuzzleBar':
			case 'UnloadedPuzzleBar':
				if(typeof(lateral) != 'undefined' && e.target == lateral.bar) {
					if(e.type == 'LoadedPuzzleBar') {
						aSync(this.resize);
					} else {
						this.resize();
					}
				}
				break;
		}
	},

	resize: function() {
		gBrowser.treeStyleTab.onResize({ originalTarget: window });
	}
};

Modules.LOADMODULE = function() {
	Listeners.add(window, 'nsDOMTreeStyleTabTabbarPositionChanged', TreeStyleTab);
	Listeners.add(window, 'nsDOMTreeStyleTabAutoHideStateChange', TreeStyleTab);
	Listeners.add(window, 'ToggledPuzzleBar', TreeStyleTab);
	Listeners.add(window, 'LoadedAutoHidePuzzleBar', TreeStyleTab);
	Listeners.add(window, 'UnloadedAutoHidePuzzleBar', TreeStyleTab);
	Listeners.add(window, 'LoadedPuzzleBar', TreeStyleTab);
	Listeners.add(window, 'UnloadedPuzzleBar', TreeStyleTab);
};

Modules.UNLOADMODULE = function() {
	Listeners.remove(window, 'nsDOMTreeStyleTabTabbarPositionChanged', TreeStyleTab);
	Listeners.remove(window, 'nsDOMTreeStyleTabAutoHideStateChange', TreeStyleTab);
	Listeners.remove(window, 'ToggledPuzzleBar', TreeStyleTab);
	Listeners.remove(window, 'LoadedAutoHidePuzzleBar', TreeStyleTab);
	Listeners.remove(window, 'UnloadedAutoHidePuzzleBar', TreeStyleTab);
	Listeners.remove(window, 'LoadedPuzzleBar', TreeStyleTab);
	Listeners.remove(window, 'UnloadedPuzzleBar', TreeStyleTab);
};
