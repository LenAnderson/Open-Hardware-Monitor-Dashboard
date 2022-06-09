var WidgetDlg = (function() {
	//
	// nodes
	//
	var _sensor;
	var _title;
	var _type = {
		graph: undefined,
		value: undefined
	};
	var _graph = {
		lineColor: undefined,
		lineColorPicker: undefined,
		lineColorOpacity: undefined,
		fillColor: undefined,
		fillColorPicker: undefined,
		fillColorOpacity: undefined,
		history: undefined,
		max: undefined
	};
	var _value = {
		fontSize: undefined,
		color: undefined,
		colorPicker: undefined,
		colorOpacity: undefined,
		format: undefined
	}
	
	
	//
	// vars
	//
	var promise;
	var element;
	var dlg;
	var sensors;
	var defaultConfig = {
		sensor: '',
		title: 'New Widget',
		type: 'graph',
		graph: {
			lineColor: 'rgba(115, 115, 90, 0.25)',
			fillColor: 'rgba(115, 115, 90, 0.25)',
			history: 60,
			max: 0
		},
		value: {
			color: 'rgba(115,115,90,0.5)',
			fontSize: 32,
			format: '0.0 $unit'
		}
	};
	var widget;
	var isOld = false;
	
	
	//
	// methods
	//
	
	// constructor
	function WidgetDlg() {
		element = document.createElement('div');
		element.innerHTML = '${include-min-esc: html/widget-dlg.html}';
		$('#app').appendChild(element);
		dlg = element.children[0];
		
		_sensor = dlg.$('#dlg-widget-sensor');
		_title = dlg.$('#dlg-widget-title');
		_type.graph = dlg.$('#dlg-widget-type-graph');
		_type.value = dlg.$('#dlg-widget-type-value');
		_graph = dlg.$('#dlg-widget-graph');
		_graph.lineColor = dlg.$('#dlg-widget-graph-lineColor');
		_graph.lineColorPicker = dlg.$('#dlg-widget-graph-lineColor-picker');
		_graph.lineColorOpacity = dlg.$('#dlg-widget-graph-lineColor-opacity');
		_graph.fillColor = dlg.$('#dlg-widget-graph-fillColor');
		_graph.fillColorPicker = dlg.$('#dlg-widget-graph-fillColor-picker');
		_graph.fillColorOpacity = dlg.$('#dlg-widget-graph-fillColor-opacity');
		_graph.history = dlg.$('#dlg-widget-graph-history');
		_graph.max = dlg.$('#dlg-widget-graph-max');
		_value = dlg.$('#dlg-widget-value');
		_value.fontSize = dlg.$('#dlg-widget-value-fontSize');
		_value.color = dlg.$('#dlg-widget-value-color');
		_value.colorPicker = dlg.$('#dlg-widget-value-color-picker');
		_value.colorOpacity = dlg.$('#dlg-widget-value-color-opacity');
		_value.format = dlg.$('#dlg-widget-value-format');
		
		dlg.$('#dlg-widget-cancel').addEventListener('click', function() {
			dlg.hide();
		});
		dlg.$('#dlg-widget-ok').addEventListener('click', ok);
		
		_graph.fillColor.addEventListener('change', function() {
			_graph.fillColorPicker.value = this.value;
		});
		_graph.fillColorPicker.addEventListener('change', function() {
			_graph.fillColor.value = this.value;
		});
		_graph.lineColor.addEventListener('change', function() {
			_graph.lineColorPicker.value = this.value;
		});
		_graph.lineColorPicker.addEventListener('change', function() {
			_graph.lineColor.value = this.value;
		});
		_sensor.addEventListener('change', function() {
			if (!isOld) {
				dlg.$('#dlg-widget-title').value = _sensor.$(':checked').dataId.join(' - ');
			}
			if (_sensor.value == 'Time') {
				_type.value.click();
				_value.format.value = '0:00';
			}
			dlg.$('#dlg-widget-title').focus();
			dlg.$('#dlg-widget-title').blur();
		});
		_type.graph.addEventListener('click', function() {
			_graph.delClass('hidden');
			_value.addClass('hidden');
		});
		_type.value.addEventListener('click', function() {
			_value.delClass('hidden');
			_graph.addClass('hidden');
		});
		_value.color.addEventListener('change', function() {
			_value.colorPicker.value = _value.color.value;
		});
		_value.colorPicker.addEventListener('change', function() {
			_value.color.value = _value.colorPicker.value;
		});
	}
	
	function show(evt, theWidget) {
		_sensor.delClass('error');
		widget = theWidget
		var config = widget ? widget.getConfig() : defaultConfig;
		_sensor.value = config.sensor;
		_title.value = config.title;
		if (config.type == 'graph') {
			_graph.delClass('hidden');
			_value.addClass('hidden');
			_type.graph.checked = true;
		} else if (config.type == 'value') {
			_value.delClass('hidden');
			_graph.addClass('hidden');
			_type.value.checked = true;
		}
		if (config.type == 'graph' || !theWidget) {
			var lineColorParts = config.graph.lineColor.match(/[0-9\.]+/g);
			var fillColorParts = config.graph.fillColor.match(/[0-9\.]+/g);
			_graph.lineColor.value = '#' + ("00"+parseInt(lineColorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(lineColorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(lineColorParts[2]).toString(16)).slice(-2);
			_graph.lineColorPicker.value = '#' + ("00"+parseInt(lineColorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(lineColorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(lineColorParts[2]).toString(16)).slice(-2);
			_graph.lineColorOpacity.value = parseFloat(lineColorParts[3])*100;
			_graph.fillColor.value = '#' + ("00"+parseInt(fillColorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(fillColorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(fillColorParts[2]).toString(16)).slice(-2);
			_graph.fillColorPicker.value = '#' + ("00"+parseInt(fillColorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(fillColorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(fillColorParts[2]).toString(16)).slice(-2);
			_graph.fillColorOpacity.value = parseFloat(fillColorParts[3])*100;
			_graph.history.value = config.graph.history;
			_graph.max.value = config.graph.max;
		} if (config.type == 'value' || !theWidget) {
			var colorParts = config.value.color.match(/[0-9\.]+/g);
			_value.fontSize.value = config.value.fontSize;
			_value.color.value = '#' + ("00"+parseInt(colorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[2]).toString(16)).slice(-2);
			_value.colorPicker.value = '#' + ("00"+parseInt(colorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[2]).toString(16)).slice(-2);
			_value.colorOpacity.value = parseFloat(colorParts[3])*100;
			_value.format.value = config.value.format;
		}
		if (theWidget) {
			// _sensor.disabled = true;
			_type.graph.disabled = true;
			_type.value.disabled = true;
			isOld = true;
		} else {
			_sensor.disabled = false;
			_type.graph.disabled = false;
			_type.value.disabled = false;
		}
		
		dlg.show(evt);
		_title.focus();
		_title.blur();
	}
	
	function ok() {
		if (widget) {
			if (_sensor.value == '') {
				_sensor.addClass('error');
				dlg.$('.content').addClass('shake');
				setTimeout(function() { dlg.$('.content').delClass('shake'); }, 900);
				return;
			}
			widget.setSensor(_sensor.$(':checked').dataId, _sensor.value);
			widget.setTitle(_title.value.trim());
			if (widget.getConfig().type == 'graph') {
				widget.setHistory(parseInt(_graph.history.value));
				widget.setLineColor(_graph.lineColor.value, _graph.lineColorOpacity.value);
				widget.setFillColor(_graph.fillColor.value, _graph.fillColorOpacity.value);
				widget.setMax(parseFloat(_graph.max.value));
			} else if (widget.getConfig().type == 'value') {
				widget.setFontSize(parseInt(_value.fontSize.value));
				widget.setColor(_value.color.value, _value.colorOpacity.value);
				widget.setFormat(_value.format.value);
			}
		} else {
			if (_sensor.value == '') {
				_sensor.addClass('error');
				dlg.$('.content').addClass('shake');
				setTimeout(function() { dlg.$('.content').delClass('shake'); }, 900);
				return;
			}
			module.raiseEvent('add', {
				id: _sensor.$(':checked').dataId,
				sensor: _sensor.value,
				title: _title.value.trim(),
				type: _type.graph.checked?'graph': _type.value.checked?'value':'',
				graph: {
					lineColor: _graph.lineColor.value,
					lineColorOpacity: _graph.lineColorOpacity.value,
					fillColor: _graph.fillColor.value,
					fillColorOpacity: _graph.fillColorOpacity.value,
					history: parseInt(_graph.history.value),
					max: parseFloat(_graph.max.value)
				},
				value: {
					fontSize: parseInt(_value.fontSize.value),
					color: _value.color.value,
					colorOpacity: _value.colorOpacity.value,
					format: _value.format.value
				},
				size: {
					height: 300,
					width: 400
				},
				position: {
					left: 10,
					top: 10
				}
			});
		}
		dlg.hide();
	}
	
	function updateSensors(data) {
		var timeOpt = document.createElement('option'); {
			timeOpt.textContent = 'Time';
			timeOpt.dataId = ['Time'];
			timeOpt.value = 'Time';
		}
		
		var offset = [];
		var struct = [timeOpt].concat(getChildStructure(data));
		setSensors(struct);
		function getChildStructure(sensor) {
			var opt = document.createElement('option');
			opt.textContent = '-'.repeat(offset.length) + sensor.Text;
			var opts = [opt];
			opt.dataId = offset.concat(sensor.Text).slice(1);
			opt.value = opt.dataId.join('---');
			offset.push(sensor.Text);
			sensor.Children.forEach(function(child) {
				opts = opts.concat(getChildStructure(child));
			});
			offset.pop();
			if (sensor.Children.length > 0) {
				opt.disabled = true;
			}
			return opts;
		}
	}
	function setSensors(opts) {
		var newSensors = opts.map(function(opt) { return opt.textContent; }).join('\n');
		if (newSensors != sensors) {
			sensors = newSensors;
			while (_sensor.children.length > 1)
				_sensor.children[1].remove();
			opts.forEach(function(it) {
				_sensor.appendChild(it);
			});
		}
	}
	
	
	
	WidgetDlg();
	var module;
	return module={
		show: show,
		updateSensors: updateSensors
	};
});