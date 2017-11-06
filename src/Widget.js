var Widget = (function(arg_config) {
	//
	// properties
	//
	var id;
	var history;
	var chart;
	var data;
	var context;
	var element;
	var dragging = false;
	var dragOffset = {left:0, top:0};
	var resizing = false;
	var resizeOrigin;
	var config;
	var unit;
	
	
	//
	// methods
	//
	
	// constructor
	function Widget(newConfig) {
		config = newConfig;
		id = config.id;
		
		element = document.createElement('div');
		element.innerHTML = '${include-min-esc: html/widget.html}';
		element.addClass('widget');
		setTitle(config.title);
		setPosition(config.position);
		
		$('#widgets').appendChild(element);
		
		
		element.addEventListener('click', toTop);
		element.$('.header').addEventListener('mousedown', dragStart);
		addEventListener('mousemove', mouseMove);
		addEventListener('mouseup', mouseUp);
		
		element.$('.close').addEventListener('click', remove);
		element.$('.config').addEventListener('click', configure);
		
		if (config.type == 'graph') {
			WidgetGraph();
		} else if (config.type == 'value') {
			WidgetValue();
		}
		toTop();
	};
	function WidgetGraph() {
		element.$('.content').innerHTML = '${include-min-esc: html/widget-graph.html}';
		setSize(config.size);
		
		context = element.$('canvas').getContext('2d');
		chart = new Chart(context, {
			type: 'line',
			data: {
				labels: [],
				datasets: [{
					fill: true,
					pointRadius: 0,
					data: []
				}]
			},
			options: {
				animation: false,
				legend: false,
				maintainAspectRatio: false,
				scales: {
					yAxes: [{
						ticks: {
							suggestedMin: 0
						},
						gridLines: {
							color: 'rgba(50,50,50,0.5)'
						}
					}],
					xAxes: [{
						gridLines: {
							color: 'rgba(50,50,50,0.5)'
						}
					}]
				},
			}
		});
		data = chart.data.datasets[0].data;
		element.chart = chart;
		setHistory(config.graph.history);
		setFillColor(config.graph.fillColor, config.graph.fillColorOpacity);
		setLineColor(config.graph.lineColor, config.graph.lineColorOpacity);
		setMax(config.graph.max);
		
		element.$('.resizer').addEventListener('mousedown', resizeStart);
	}
	function WidgetValue() {
		element.$('.content').innerHTML = '${include-min-esc: html/widget-value.html}';
		data = [];
		setColor(config.value.color, config.value.colorOpacity);
		setFontSize(config.value.fontSize);
		setFormat(config.value.format);
		
	}
	
	// drag 'n' drop
	function toTop() {
		var top = $('.widget.top')
		if (top) {
			top.delClass('top');
		}
		element.addClass('top');
	}
	function dragStart(evt) {
		toTop();
		if (!dragging) {
			evt.preventDefault();
			dragging = true;
			element.classList.add('hovered');
			var style = getComputedStyle(element);
			dragOffset = {
				left: parseInt(style.getPropertyValue("left"),10) - evt.clientX,
				top: parseInt(style.getPropertyValue("top"),10) - evt.clientY
			};
		}
	}
	function resizeStart(evt) {
		toTop();
		if (!resizing) {
			evt.preventDefault();
			resizing = true;
			element.classList.add('hovered');
			var rect = element.getBoundingClientRect();
			resizeOrigin = {
				left: rect.right,
				top: rect.bottom,
				height: rect.height,
				width: rect.width
			};
		}
	}
	function mouseMove(evt) {
		if (dragging) {
			evt.preventDefault();
			setPosition({
				left: evt.clientX + dragOffset.left,
				top: evt.clientY + dragOffset.top
			});
		} else if (resizing) {
			evt.preventDefault();
			setSize({
				height: resizeOrigin.height + evt.clientY - resizeOrigin.top,
				width: resizeOrigin.width + evt.clientX - resizeOrigin.left
			});
		}
	}
	function mouseUp(evt) {
		if (dragging) {
			evt.preventDefault();
			dragging = false;
			element.classList.remove('hovered');
			dragOffset = undefined;
		} else if (resizing) {
			evt.preventDefault();
			resizing = false;
			element.classList.remove('hovered');
			resizeOrigin = undefined;
		}
	}
	
	function raiseEvent(type, args) {
		if (module) {
			module.raiseEvent(type, args);
		}
	}
	function raiseConfigEvent() {
		raiseEvent('config', {widget:module, config:config});
	}
	
	function getConfig() {
		return config;
	}
	
	function setHistory(ticks) {
		config.graph.history = ticks;
		raiseConfigEvent();
		history = ticks;
		updateChart();
	}
	function setMax(max) {
		config.graph.max = max;
		raiseConfigEvent();
		chart.options.scales.yAxes[0].ticks.suggestedMax = max;
	}
	function setAutoMax(max) {
		chart.options.scales.yAxes[0].ticks.suggestedMax = max;
	}
	
	function setLineColor(color, opacity) {
		if (color[0] == '#') {
			var parts = color.substring(1).match(/.{2}/g);
			color = 'rgba(' + parseInt(parts[0],16) + ',' + parseInt(parts[1],16) + ',' + parseInt(parts[2],16) + ',' + (opacity/100) + ')';
		}
		config.graph.lineColor = color;
		raiseConfigEvent();
		chart.data.datasets[0].borderColor = color;
		updateChart();
	}
	function setFillColor(color, opacity) {
		if (color[0] == '#') {
			var parts = color.substring(1).match(/.{2}/g);
			color = 'rgba(' + parseInt(parts[0],16) + ',' + parseInt(parts[1],16) + ',' + parseInt(parts[2],16) + ',' + (opacity/100) + ')';
		}
		config.graph.fillColor = color;
		raiseConfigEvent();
		chart.data.datasets[0].backgroundColor = color;
		updateChart();
	}
	
	function setColor(color, opacity) {
		if (color[0] == '#') {
			var parts = color.substring(1).match(/.{2}/g);
			color = 'rgba(' + parseInt(parts[0],16) + ',' + parseInt(parts[1],16) + ',' + parseInt(parts[2],16) + ',' + (opacity/100) + ')';
		}
		config.value.color = color;
		raiseConfigEvent();
		element.$('.value').style.color = color;
	}
	function setFontSize(size) {
		config.value.fontSize = size;
		raiseConfigEvent();
		element.$('.value').style.fontSize = size + 'px';
	}
	function setFormat(format) {
		config.value.format = format;
		raiseConfigEvent();
	}
	
	function setTitle(title) {
		config.title = title;
		raiseConfigEvent();
		element.$('.title').textContent = title;
	}
	
	function setData(newData) {
		var sensor = newData;
		if (id == 'Time') {
			var now = new Date();
			sensor = {Value: now.getHours()+','+now.getMinutes().toString().padStart(2,'0')};
		}
		else {
			id.forEach(function(part) {
				if (sensor) {
					sensor = sensor.Children.find(function(it) { return it.Text == part; });
				}
			});
		}
		if (sensor) {
			data.push(parseFloat(sensor.Value.replace(',', '.')));
		}
		setUnit(sensor.Value.replace(/^\d+([,\.]\d+)?\s*(.*)$/, '$2'));
		if (config.type == 'graph') {
			if (config.graph.max == 0) {
				if (sensor.Value.search(/%$/) != -1) {
					setAutoMax(100);
				} else {
					setAutoMax(undefined);
				}
			}
			updateChart();
		} else if (config.type == 'value') {
			updateValue();
		}
	}
	
	// function setMax(max) {
		// chart.options.scales.yAxes[0].ticks.suggestedMax = max;
	// }
	function setUnit(newUnit) {
		unit = newUnit;
	}
	
	function setSize(size) {
		config.size = size;
		raiseConfigEvent();
		element.style.width = (Config.grid?Math.round(size.width/Config.gridSize)*Config.gridSize : size.width) + 'px';
		element.style.height = (Config.grid?Math.round(size.height/Config.gridSize)*Config.gridSize : size.height) + 'px';
	}
	function setPosition(position) {
		config.position = position;
		raiseConfigEvent();
		element.style.left = (Config.grid?Math.round(position.left/Config.gridSize)*Config.gridSize : position.left) + 'px';
		element.style.top = (Config.grid?Math.round(position.top/Config.gridSize)*Config.gridSize : position.top) + 'px';
	}
	
	function updateValue() {
		while (data.length > 1)
			data.shift();
		var parts = config.value.format.match(/(\d+)(?:([\.,:])(\d+))?/);
		if (parts[2] == undefined) parts[2] = '';
		if (parts[3] == undefined) parts[3] = '';
		var value = '';
		var leading = '';
		if (parts[1].length > 0 && parseInt(data[0]).toString().length < parts[1].length) {
			leading = "0".repeat(parts[1].length-parseInt(data[0]).toString().length);
		}
		value += parseInt(data[0]);
		if (parts[2].length > 0) {
			value += parts[2];
		}
		if (parts[3].length > 0) {
			value += data[0].toFixed(parts[3].length).slice(-parts[3].length);
		}
		element.$('.value > .current').textContent = config.value.format.replace(/(\d+)(?:([\.,:])(\d+))?/, value).replace(/\$unit/, unit);
		element.$('.value > .leading').textContent = leading;
	}
	function updateChart() {
		var labels = [];
		var skip = Math.round(history / 15);
		for (var i=-history;i<1;i++) {
			if (i%skip == 0)
				labels.push(i);
			else
				labels.push('');
		}
		chart.data.labels = labels;
		while (data.length < history + 1) {
			data.unshift(null);
		}
		while (data.length > history + 1) {
			data.shift();
		}
		chart.update();
	}
	
	function remove() {
		element.remove();
		raiseEvent('remove', module);
	}
	
	function configure(evt) {
		evt.preventDefault();
		evt.stopPropagation();
		raiseEvent('showConfig', {evt:evt, widget:module});
	}
	
	
	Widget(arg_config);
	var module;
	return module={
		setData: setData,
		setTitle: setTitle,
		setHistory: setHistory,
		setMax: setMax,
		setLineColor: setLineColor,
		setFillColor: setFillColor,
		setFontSize: setFontSize,
		setColor: setColor,
		setFormat: setFormat,
		getConfig: getConfig
	};
});