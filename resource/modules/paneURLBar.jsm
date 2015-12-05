// VERSION 1.0.0

this.urlbarCheckboxes = function() {
	Timers.init('urlbarCheckboxes', function() {
		var pp = $(objName+'-urlbar-ppCheckbox');
		var autohide = $(objName+'-urlbar-autohideCheckbox');
		var whenfocused = $(objName+'-urlbar-whenfocusedCheckbox');

		if(autohide.checked && !pp.checked && !whenfocused.checked) {
			autohide.checked = false;
			autohide.doCommand(); // trigger dependencies
		}
	});
};
