/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.0.0

this.__defineGetter__('tabGroups', function() { return window.tabGroups; });

this.tg = {
	id: 'tabgroups@quicksaver',

	initialized: false,

	onEnabled: function(addon) {
		if(addon.id == this.id) { this.enable(); }
	},

	onDisabled: function(addon) {
		if(addon.id == this.id) { this.disable(); }
	},

	listen: function() {
		AddonManager.addAddonListener(this);
		AddonManager.getAddonByID(this.id, (addon) => {
			if(addon && addon.isActive) { this.enable(); }
		});
	},

	unlisten: function() {
		AddonManager.removeAddonListener(this);
		this.disable();
	},

	enable: function() {
		if(this.initialized) { return; }
		this.initialized = true;

		// Preventing "blinking" TG's quick access panel.
		Piggyback.add('tabGroups', tabGroups.quickAccess, 'toggle', function() {
			// check to see if it's placed in our toolbars
			let placement = CustomizableUI.getPlacementOfWidget(tabGroups.TabView.kButtonId);
			if(!placement || possibleBars.indexOf(placement.area) == -1) {
				return true;
			}

			// Is bar initialized?
			let bar = bars.get(placement.area);
			if(!bar || !bar._autohide) {
				return true;
			}

			// Bar is already showing, just make sure it doesn't hide for a bit.
			if(trueAttribute(bar,'hover')) {
				autoHide.initialShow(bar);
				return true;
			}

			// re-command the panel to open when the bar finishes showing
			let listener = () => {
				bar._transition.remove(listener);

				// unfortunately this won't happen inside popupsFinishedVisible in this case
				if(bar.hovers === 1 && $$('#'+bar.id+':hover')[0]) {
					autoHide.setHover(bar, true);
				}

				// get the anchor reference again, in case the previous node was lost
				this._toggle();
			};
			bar._transition.add(listener);

			// show the toolbar
			autoHide.initialShow(bar);

			return false;
		}, Piggyback.MODE_BEFORE);
	},

	disable: function() {
		if(!this.initialized) { return; }
		this.initialized = false;

		Piggyback.revert('tabGroups', tabGroups.quickAccess, 'toggle');
	}
};

Modules.LOADMODULE = function() {
	tg.listen();
};

Modules.UNLOADMODULE = function() {
	tg.unlisten();
};
