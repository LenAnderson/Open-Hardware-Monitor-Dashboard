var prefs = {
	meta: {
		version: 1
	},
	
	
	// general settings
	refreshRate: 1,
	
	// dashboard setup
	widgets: [
		{
			id: ['DEABW03004', 'Intel Core i3-3240', 'Load', 'CPU Total'],
			title: 'CPU Total',
			position: {
				left: 0,
				top: 0
			},
			size: {
				width: 400,
				height: 300
			}
		}
	],
	
	
	// funcs
	save: function() {
		//localStorage.setItem('ohmd-prefs', JSON.stringify(this));
	},
	load: function() {
		var prefs = false;
		try {
			prefs = JSON.parse(localStorage.getItem('ohmd-prefs'));
		} catch (ex) {}
		if (prefs && prefs.meta && prefs.meta.version) {
			switch (prefs.meta.version) {
				case 1:
					this.initV1(prefs);
					break;
				default:
					alert('Unknown preferences format (version "' + prefs.meta.version + '").\n\nPreferences will be reset to default values.');
					this.save();
					break;
			}
		}
	},
	initV1: function(prefs) {
		for (var key in prefs) {
			if (prefs.hasOwnProperty(key) && this.hasOwnProperty(key)) {
				this[key] = prefs[key];
			}
		}
	}
};