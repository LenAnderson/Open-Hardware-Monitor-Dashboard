var Widget = (function(arg_config) {
	//
	// private properties
	//
	var _history;
	var _id;
	var _chart;
	var _data;
	var _context;
	var _template = '${include-min-esc: html/widget-graph.html}';
	
	
	//
	//public properties
	//
	var module = {};
	module.element = undefined;
	
	
	//
	// public methods
	//
	
	// constructor
	module.Widget = function(config) {
		_id = config.id;
		initWidget(config);
		// data.addListener('update', module.setData);
	}.bind(this);
	
	module.setHistory = function(ticks) {
		_history = ticks;
		updateChart();
	}.bind(this);
	
	module.setTitle = function(title) {
		module.element.$('.title').textContent = title;
	}.bind(this);
	
	module.setData = function(data) {
		var sensor = data;
		_id.forEach(function(id) {
			if (sensor) {
				sensor = sensor.Children.find(function(it) { return it.Text == id; });
			}
		});
		if (sensor) {
			_data.push(parseInt(sensor.Value));
		}
		if (sensor.Value.search(/%$/) != -1) {
			module.setMax(100);
		} else {
			module.setMax(undefined);
		}
		updateChart();
	}.bind(this);
	
	module.setMax = function(max) {
		_chart.options.scales.yAxes[0].ticks.suggestedMax = 100;
	}.bind(this);
	
	module.setSize = function(size) {
		module.element.style.height = size.height + 'px';
		module.element.style.width = size.width + 'px';
	}.bind(this);
	module.setPosition = function(position) {
		module.element.style.left = position.left + 'px';
		module.element.style.top = position.top + 'px';
	}.bind(this);
	
	
	//
	// private methods
	//
	var initWidget = function(config) {
		module.element = document.createElement('div');
		module.element.innerHTML = _template;
		module.element.classList.add('widget');
		module.setTitle(config.title);
		module.setPosition(config.position);
		module.setSize(config.size);
		
		$('#widgets').appendChild(module.element);
		
		_context = module.element.$('canvas').getContext('2d');
		_chart = new Chart(_context, {
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
						}
					}]
				}
			}
		});
		_data = _chart.data.datasets[0].data;
		module.element.chart = _chart;
		
		module.setHistory(config.history);
	};
	
	var updateChart = function() {
		var labels = [];
		var skip = Math.round(_history / 15);
		for (var i=-_history;i<1;i++) {
			if (i%skip == 0)
				labels.push(i);
			else
				labels.push('');
		}
		_chart.data.labels = labels;
		if (_data.length < _history + 1) {
			for (var i=0;_history + 1 - _data.length>0;i++) {
				_data.unshift(null);
			}
		} else if (_data.length > _history + 1) {
			for (var i=0;i<_data.length - _history - 1;i++) {
				_data.shift();
			}
		}
		_chart.update()
	}
	
	
	
	module.Widget(arg_config);
	return module;
});