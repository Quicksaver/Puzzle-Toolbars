Modules.VERSION = '1.0.2';

// this is just to migrate all the items and preferences from thePuzzlePiece-addon-bar to this new version of the add-on,
// it can probably be removed in the future when most users have updated

Modules.LOADMODULE = function() {
	if(!Prefs.migratedLegacy) {
		Prefs.migratedLegacy = true;
		
		if(!CUIBackstage.gPlacements.has('thePuzzlePiece-addon-bar')
		&& (!CUIBackstage.gSavedState || !CUIBackstage.gSavedState.placements || !CUIBackstage.gSavedState.placements['thePuzzlePiece-addon-bar'])) {
			return;
		}
		
		Prefs.setDefaults({
			movetoRight: true,
			autoHide: false,
			autoHideWhenFocused: false,
			placement: 'bottom',
			showPPs: true,
			addonBarKeycode: '/',
			addonBarAccel: true,
			addonBarShift: false,
			addonBarAlt: false
		}, 'thepuzzlepiece');
		
		switch(Prefs.placement) {
			case 'bottom':
				Prefs.bottom_placement = (Prefs.movetoRight) ? 'right' : 'left';
				Prefs.bottom_pp = Prefs.showPPs;
				Prefs.bottom_keycode = Prefs.addonBarKeycode;
				Prefs.bottom_accel = Prefs.addonBarAccel;
				Prefs.bottom_shift = Prefs.addonBarShift;
				Prefs.bottom_alt = Prefs.addonBarAlt;
				break;
			case 'corner':
				Prefs.corner_bar = true;
				Prefs.corner_placement = (Prefs.movetoRight) ? 'right' : 'left';
				Prefs.corner_pp = Prefs.showPPs;
				Prefs.corner_autohide = Prefs.autoHide;
				Prefs.corner_keycode = Prefs.addonBarKeycode;
				Prefs.corner_accel = Prefs.addonBarAccel;
				Prefs.corner_shift = Prefs.addonBarShift;
				Prefs.corner_alt = Prefs.addonBarAlt;
				break;
			case 'urlbar':
				Prefs.urlbar_bar = true;
				Prefs.urlbar_pp = Prefs.showPPs;
				Prefs.urlbar_autohide = Prefs.autoHide;
				Prefs.urlbar_whenfocused = Prefs.autoHideWhenFocused;
				Prefs.urlbar_keycode = Prefs.addonBarKeycode;
				Prefs.urlbar_accel = Prefs.addonBarAccel;
				Prefs.urlbar_shift = Prefs.addonBarShift;
				Prefs.urlbar_alt = Prefs.addonBarAlt;
				break;
			default:
				// this should never happen, but...
				Prefs.placement = 'bottom';
				break;
		}
		
		try {
			var oldPlacements = CUIBackstage.gPlacements.has('thePuzzlePiece-addon-bar')
				? CUIBackstage.gPlacements.get('thePuzzlePiece-addon-bar')
				: CUIBackstage.gSavedState.placements['thePuzzlePiece-addon-bar'];
			
			var newPlacements = [];
			var newPlacementsSet = new Set();
			for(var item of oldPlacements) {
				if(item.indexOf('thePuzzlePiece') > -1) { continue; }
				newPlacements.push(item);
				newPlacementsSet.add(item);
			}
			
			if(CUIBackstage.gPlacements.has('thePuzzlePiece-addon-bar')) {
				CUIBackstage.gPlacements.delete('thePuzzlePiece-addon-bar');
			}
			if(CUIBackstage.gSavedState && CUIBackstage.gSavedState.placements) {
				delete CUIBackstage.gSavedState.placements['thePuzzlePiece-addon-bar'];
				CUIBackstage.gSavedState.placements[objName+'-'+Prefs.placement+'-bar'] = newPlacements;
			}
			if(CUIBackstage.gFuturePlacements.has(objName+'-'+Prefs.placement+'-bar')) {
				CUIBackstage.gFuturePlacements.delete(objName+'-'+Prefs.placement+'-bar');
			}
			CUIBackstage.gFuturePlacements.set(objName+'-'+Prefs.placement+'-bar', newPlacementsSet);
			
			CUIBackstage.gDirty = true;
			CUIBackstage.CustomizableUIInternal.saveState();
		}
		catch(ex) { /* don't bother */ }
		
		Prefs.reset('movetoRight');
		Prefs.reset('autoHide');
		Prefs.reset('autoHideWhenFocused');
		Prefs.reset('placement');
		Prefs.reset('showPPs');
		Prefs.reset('addonBarKeycode');
		Prefs.reset('addonBarAccel');
		Prefs.reset('addonBarShift');
		Prefs.reset('addonBarAlt');
	}
};
