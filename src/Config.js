var Config = {
	widgets: [],
	grid: false,
	gridSize: 10,
	showGrid: false,
	gridColor: 'rgba(0,0,0,0.75)',
	
	save: function() {
		localStorage.setItem('ohmd-config', JSON.stringify(this));
	},
	load: function() {
		var config;
		try {
			config = JSON.parse(localStorage.getItem('ohmd-config'));
		} catch (ex) {}
		if (config) {
			if (config.widgets && config.widgets instanceof Array) {
				this.widgets = config.widgets;
			}
			if (config.grid && typeof config.grid == 'boolean') {
				this.grid = config.grid;
			}
			if (config.gridSize && typeof config.gridSize == 'number') {
				this.gridSize = parseInt(config.gridSize);
			}
			if (config.showGrid && typeof config.showGrid == 'boolean') {
				this.showGrid = config.showGrid;
			}
			if (config.gridColor) {
				this.gridColor = config.gridColor;
			}
		}
	}
}