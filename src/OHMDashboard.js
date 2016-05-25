var OHMDashboard = (function() {
	//
	// properties
	//
	
	var _data = new Data();
	var _widgets = [];
	var sensors;
	var widgetDlg;
	
	
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
		
		md.init();
		
		
		
		_data.addListener('update', updateData);
		
		var conf = JSON.parse(localStorage.getItem('ohmd-config'));
		conf.widgets.forEach(addWidget);
	};
	
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
		var conf = {
			widgets: []
		};
		conf.widgets = _widgets.map(function(widget) { return widget.getConfig(); });
		localStorage.setItem('ohmd-config', JSON.stringify(conf));
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