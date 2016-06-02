var OHMDashboard = (function() {
	//
	// properties
	//
	
	var _data = new Data();
	var _widgets = [];
	var sensors;
	var widgetDlg;
	var settingsDlg;
	
	
	//
	// methods
	//
	
	// constructor
	function OHMDashboard() {
		document.body.parentNode.innerHTML = '${include-min-esc: html/dashboard.html}';
		
		widgetDlg = new WidgetDlg();
		widgetDlg.addListener('add', addWidget);
		widgetDlg.addListener('change', changeWidget);
		$('#new').addEventListener('click', widgetDlg.show);
		
		settingsDlg = new SettingsDlg();
		settingsDlg.addListener('change', changeSettings);
		$('#settings').addEventListener('click', settingsDlg.show);
		
		md.init();
		
		
		
		_data.addListener('update', updateData);
		
		Config.load();
		Config.widgets.forEach(addWidget);
		
		if (Config.showGrid) {
			showGrid();
		}
	};
	
	function showGrid() {
		$('#app').addClass('grid');
			$('#app').style.backgroundColor = Config.gridColor;
			$('#app').style.backgroundImage = 'repeating-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, rgb(245, 245, 245) 1px, rgb(245, 245, 245) ' + Config.gridSize + 'px),\
						repeating-linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, rgb(245, 245, 245) 1px, rgb(245, 245, 245) ' + Config.gridSize + 'px)';
	}
	function hideGrid() {
		$('#app').delClass('grid');
		$('#app').style.backgroundColor = '';
		$('#app').style.backgroundImage = '';
	}
	
	function changeSettings(settings) {
		console.info('changeSettings', settings);
		Config.grid = settings.grid;
		Config.gridSize = settings.gridSize;
		Config.gridColor = settings.gridColor;
		Config.showGrid = settings.showGrid;
		Config.save();
		if (Config.showGrid) {
			showGrid();
		} else {
			hideGrid();
		}
	}
	
	function addWidget(config) {
		var widget = new Widget(config);
		widget.addListener('remove', removeWidget);
		widget.addListener('config', updateConfig);
		widget.addListener('showConfig', showConfig);
		_widgets.push(widget);
		updateConfig();
	}
	function changeWidget(args) {
		removeWidget(args.widget);
		addWidget(args.config);
	}
	function removeWidget(widget) {
		_widgets.splice(_widgets.lastIndexOf(widget), 1);
		updateConfig();
	}
	
	function updateConfig() {
		Config.widgets = _widgets.map(function(widget) { return widget.getConfig(); });
		Config.save();
	}
	function showConfig(evt) {
		widgetDlg.show(evt.evt, evt.widget);
	}
	
	function updateData(data) {
		_widgets.forEach(function(widget) {
			widget.setData(data);
		});
		widgetDlg.updateSensors(data);
	}
	
	
	
	OHMDashboard();
	return module={
	};
});