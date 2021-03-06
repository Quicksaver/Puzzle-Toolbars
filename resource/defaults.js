/* This Source Code Form is subject to the terms of the Mozilla Public
 * License, v. 2.0. If a copy of the MPL was not distributed with this
 * file, You can obtain one at http://mozilla.org/MPL/2.0/. */

// VERSION 1.4.1

objName = 'puzzleBars';
objPathString = 'puzzlebars';
addonUUID = '9c522ae0-5241-11e4-916c-0800200c9a66';

addonUris = {
	homepage: 'https://addons.mozilla.org/firefox/addon/puzzle-toolbars/',
	support: 'https://github.com/Quicksaver/Puzzle-Toolbars/issues',
	fullchangelog: 'https://github.com/Quicksaver/Puzzle-Toolbars/commits/master',
	email: 'mailto:quicksaver@gmail.com',
	profile: 'https://addons.mozilla.org/firefox/user/quicksaver/',
	api: 'http://fasezero.com/addons/api/puzzlebars',
	development: 'http://fasezero.com/addons/'
};

prefList = {
	bottom_bar: true,
	bottom_pp: true,
	bottom_placement: 'left',
	bottom_keycode: '/',
	bottom_accel: true,
	bottom_shift: false,
	bottom_alt: false,
	bottom_ctrl: false,

	corner_bar: true,
	corner_pp: true,
	corner_placement: 'right',
	corner_autohide: true,
	corner_hotspotHeight: 6,
	corner_extend: false,
	corner_keycode: 'VK_F2',
	corner_accel: false,
	corner_shift: false,
	corner_alt: false,
	corner_ctrl: false,

	urlbar_bar: true,
	urlbar_pp: true,
	urlbar_autohide: true,
	urlbar_whenfocused: false,
	urlbar_keycode: 'none',
	urlbar_accel: false,
	urlbar_shift: false,
	urlbar_alt: false,
	urlbar_ctrl: false,

	lateral_bar: true,
	lateral_pp: true,
	lateral_bottom: false,
	lateral_placement: 'left',
	lateral_autohide: false,
	lateral_keycode: 'none',
	lateral_accel: false,
	lateral_shift: false,
	lateral_alt: false,
	lateral_ctrl: false,

	top_bar: false,
	top_pp: true,
	top_placement: 'right',
	top_slimChrome: true,
	top_keycode: 'none',
	top_accel: false,
	top_shift: false,
	top_alt: false,
	top_ctrl: false,

	// for internal use
	migratedKeysets: false,

	// for compatibility with Beyond Australis add-on
	tFOB: false,

	// hidden preference to not show the addon bar autohiding on startup
	noInitialShow: false
};

// If we're initializing in a content process, we don't care about the rest
if(isContent) { throw 'isContent'; }

paneList = [
	[ 'paneBottom' ],
	[ 'paneCorner' ],
	[ 'paneLateral' ],
	[ 'paneTop', true ],
	[ 'paneURLBar', true ],
];

function onStartup() {
	Modules.load('compatibilityFix/sandboxFixes');
	Modules.load('specialWidgets');
	Modules.load('statusBar');

	// the add-on initialization is done inside the statusBar module so it can correctly handle the status-bar in all windows
}

function onShutdown() {
	// deinitialization is also done inside statusBar, just like above

	Modules.unload('statusBar');
	Modules.unload('specialWidgets');
	Modules.unload('compatibilityFix/sandboxFixes');
}
