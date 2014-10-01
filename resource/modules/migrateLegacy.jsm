moduleAid.VERSION = '1.0.0';

// this is just to migrate all the items and preferences from thePuzzlePiece-addon-bar to this new version of the add-on,
// it can probably be removed in the future when most users have updated

moduleAid.LOADMODULE = function() {
	if(!prefAid.migratedLegacy) {
		prefAid.migratedLegacy = true;
		
		if(!CUIBackstage.gPlacements.has('thePuzzlePiece-addon-bar')
		&& (!CUIBackstage.gSavedState || !CUIBackstage.gSavedState.placements || !CUIBackstage.gSavedState.placements['thePuzzlePiece-addon-bar'])) {
			return;
		}
		
		prefAid.setDefaults({
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
		
		switch(prefAid.placement) {
			case 'bottom':
				prefAid.bottom_right = prefAid.movetoRight;
				prefAid.bottom_pp = prefAid.showPPs;
				prefAid.bottom_keycode = prefAid.addonBarKeycode;
				prefAid.bottom_accel = prefAid.addonBarAccel;
				prefAid.bottom_shift = prefAid.addonBarShift;
				prefAid.bottom_alt = prefAid.addonBarAlt;
				break;
			case 'corner':
				prefAid.corner_bar = true;
				prefAid.corner_right = prefAid.movetoRight;
				prefAid.corner_pp = prefAid.showPPs;
				prefAid.corner_autohide = prefAid.autoHide;
				prefAid.corner_keycode = prefAid.addonBarKeycode;
				prefAid.corner_accel = prefAid.addonBarAccel;
				prefAid.corner_shift = prefAid.addonBarShift;
				prefAid.corner_alt = prefAid.addonBarAlt;
				break;
			case 'urlbar':
				prefAid.urlbar_bar = true;
				prefAid.urlbar_pp = prefAid.showPPs;
				prefAid.urlbar_autohide = prefAid.autoHide;
				prefAid.urlbar_whenfocused = prefAid.autoHideWhenFocused;
				prefAid.urlbar_keycode = prefAid.addonBarKeycode;
				prefAid.urlbar_accel = prefAid.addonBarAccel;
				prefAid.urlbar_shift = prefAid.addonBarShift;
				prefAid.urlbar_alt = prefAid.addonBarAlt;
				break;
			default:
				// this should never happen, but...
				prefAid.placement = 'bottom';
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
				CUIBackstage.gSavedState.placements[objName+'-'+prefAid.placement+'-bar'] = newPlacements;
			}
			if(CUIBackstage.gFuturePlacements.has(objName+'-'+prefAid.placement+'-bar')) {
				CUIBackstage.gFuturePlacements.delete(objName+'-'+prefAid.placement+'-bar');
			}
			CUIBackstage.gFuturePlacements.set(objName+'-'+prefAid.placement+'-bar', newPlacementsSet);
			
			CUIBackstage.gDirty = true;
			CUIBackstage.CustomizableUIInternal.saveState();
		}
		catch(ex) { /* don't bother */ }
		
		prefAid.reset('movetoRight');
		prefAid.reset('autoHide');
		prefAid.reset('autoHideWhenFocused');
		prefAid.reset('placement');
		prefAid.reset('showPPs');
		prefAid.reset('addonBarKeycode');
		prefAid.reset('addonBarAccel');
		prefAid.reset('addonBarShift');
		prefAid.reset('addonBarAlt');
	}
};
