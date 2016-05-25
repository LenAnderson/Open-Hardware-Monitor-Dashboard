var gui = {
	templates: {
		graph: undefined,
		value: undefined
	},
	
	// elements
	_prefs: undefined,
	
	prefs: ${include: gui-prefs.js},
	
	init: function() {
		// template: graph
		this.templates.graph = document.createElement('div');
		this.templates.graph.addClass('widget');
		this.templates.graph.innerHTML = '${include-min-esc: html/widget-graph.html}';
		// template: value
		this.templates.value = document.createElement('div');
		this.templates.value.addClass('widget');
		this.templates.value.innerHTML = '${include-min-esc: html/widget-value.html}';
		
		document.body.parentNode.innerHTML = '${include-min-esc: html/dashboard.html}';
		
		md.init();
		
		$('#menu-link')._('click', $('#prefs').show);
		$('#new')._('click', $('#dlg-widget').show);
		
		this.createWidget({
			title: 'CPU Total',
			id: ["DEABW03004", "Intel Core i3-3240", "Load", "CPU Total"],
			history: 15,
			position: {left:0, top:10},
			size: {height:400, width:500}
		});
		this.createWidget({
			title: 'Memory Load',
			id: ["DEABW03004", "Generic Memory", "Load", "Memory"],
			history: 20,
			position: {left:550, top:10},
			size: {height:400, width:500}
		});
		// $('#widgets').appendChild(widget);
	},
	
	
	createWidget: function(config) {
		var widget = new Widget(config);
		return widget;
		// var widget = this.templates.graph.cloneNode(true);
		
		// widget.$('.title').textContent = 'My Widget';
		
		// $('#widgets').appendChild(widget);
		
		// var labels = [];
		// for (var i=-30;i<1;i++) {
			// if (i%2 == -1)
				// labels.push('');
			// else
				// labels.push(i);
		// }
		// var ctx = widget.$('canvas').getContext('2d');
		// var chart = new Chart(ctx, {
			// type: 'line',
			// data: {
				// labels: labels,
				// datasets: [{
					// fill: true,
					// pointRadius: 0,
					// data: [null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,null,4,3,1,2]
				// }]
			// },
			// options: {
				// animation: false,
				// legend: false,
				// maintainAspectRatio: false,
				// scales: {
					// yAxes: [{
						// ticks: {
							// suggestedMin: 0
						// }
					// }]
				// }
			// }
		// });
		// widget.chart = chart;
		
		// widget.update = function(data) {
			// widget.chart.data.datasets[0].data.push(Math.random()*10);
			// widget.chart.data.datasets[0].data.shift();
			// widget.chart.update();
		// };
		
		
		// data.addListener('update', widget.update.bind(widget));
		
		// return widget;
	}
};