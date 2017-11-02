// ==UserScript==
// @name         Open Hardware Monitor - Dashboard
// @banesoace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Open-Hardware-Monitor-Dashboard/raw/master/ohmd.user.js
// @version      0.3
// @author       LenAnderson
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.3/Chart.min.js
// ==/UserScript==

(function() {
	'use strict';
	
	if (localStorage.getItem('ohmd-active') && localStorage.getItem('ohmd-active') == location.href) {
		activate();
	} else {
		var cmdActivate = GM_registerMenuCommand('OHM Dashboard - Activate', function() {
			GM_unregisterMenuCommand(cmdActivate);
			localStorage.setItem('ohmd-active', location.href);
			activate();
		});
	}
	
	function activate() {
		GM_registerMenuCommand('OHM Dashboard - Deactivate', function() {
			localStorage.setItem('ohmd-active', 0);
			location.href = location.href;
		});
		var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
document.$ = document.querySelector;
document.$$ = document.querySelectorAll;
Node.prototype.$ = Element.prototype.querySelector;
Node.prototype.$$ = Element.prototype.querySelectorAll;

HTMLCollection.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.filter = Array.prototype.filter;
HTMLCollection.prototype.find = Array.prototype.find;
NodeList.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.filter = Array.prototype.filter;
NodeList.prototype.find = Array.prototype.find;

Node.prototype.addClass = function(cl) { this.classList.add(cl); return this; };
Node.prototype.delClass = function(cl) { this.classList.remove(cl); return this; };
Node.prototype.toggleClass = function(cl) { this.classList.toggle(cl); return this; };
Node.prototype.hasClass = function(cl) { return this.classList.contains(cl); };

Node.prototype._ = Node.prototype.addEventListener;


Object.prototype.addListener = function(type, func) {
	if (!this.listeners) {
		Object.defineProperty(this, 'listeners', {
			writable: true,
			value: {}
		});
	}
	if (!this.listeners[type])
		this.listeners[type] = [];
	this.listeners[type].push(func);
	return func;
};
Object.prototype.removeListener = function(type, func) {
	if (!this.listeners || !this.listeners[type])
		return;
	for (var i=0;i<this.listeners[type].length;i++) {
		if (this.listeners[type][i] != func) continue;
		this.listeners[type].splice(i,1);
	}
};
Object.prototype.raiseEvent = function(type, evt) {
	if (!this.listeners || !this.listeners[type])
		return;
	this.listeners[type].forEach(function(it) {
		it(evt);
	});
};


function get(url) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.addEventListener('load', function() {
			if (xhr.status == 200) {
				resolve(xhr.responseText);
			} else {
				reject(Error(xhr.statusText));
			}
		});
		xhr.send();
	});
}
		




/****************************************\
| $MD
\****************************************/
var md = {
	init: function() {
		this.dialog.init($$('.dialog'));
		this.menu.init($$('.menu'));
		this.tabbar.init($$('.tabbar'));
		this.ripple.init($$('button, input[type="button"], input[type="submit"], .tabbar .item, .menu .item, .toolbar .item'));
		this.progress.bar.init($$('.progress-bar'));
		this.input.init($$('.input'));
	},
	
	toasts: {
		init: function(tstss) {
			if (tstss instanceof Element) {
				tstss = [tstss];
			}
			tstss.forEach(function(tsts) {
				tsts.add = function(title, desc) {
					return this.add(tsts, title, desc);
				}.bind(this);
			}.bind(this));
		},
		add: function(tsts, title, desc) {
			var tst = document.createElement('li');
			tst.addClass('toast');
			var tstTitle = document.createElement('div');
			tstTitle.addClass('title');
			var tstInfo = document.createElement('div');
			tstInfo.addClass('info');
			tstTitle.textContent = title;
			tstInfo.textContent = desc;
			tst.appendChild(tstTitle);
			tst.appendChild(tstInfo);
			
			tsts.appendChild(tst);
			tst.style.marginTop = -tst.offsetHeight + 'px';
			if (tsts.children.length > 0) {
				tsts.insertBefore(tst, tsts.children[0]);
			} else {
				tsts.appendChild(tst);
			}
			tst.addClass('preactive');
			setTimeout(function() { tst.addClass('active'); }.bind(this), 1);
			setTimeout(function() {
				tst.delClass('active');
				setTimeout(function() { tst.remove(); }, 205);
			}.bind(this), 5000);
		}
	},
	
	dialog: {
		init: function(dlgs) {
			if (dlgs instanceof Element) {
				dlgs = [dlgs];
			}
			dlgs.forEach(function(dlg) {
				dlg.show = function(src) {
					return this.show(dlg, src);
				}.bind(this);
				dlg.hide = function() {
					return this.hide(dlg);
				}.bind(this);
			}.bind(this));
		},
		show: function(dlg, src) {
			src = src || dlg;
			return new Promise(function(resolve, reject) {
				dlg.mdDlgSrc = src;
				dlg.addClass('preactive');
				var c = dlg.$('.content');
				var b = c.getBoundingClientRect();
				
				var bb;
				if (src instanceof MouseEvent) {
					bb = {top: src.clientY, height: 0, left: src.clientX, width: 0};
				} else {
					bb = src.getBoundingClientRect();
				}
				
				var y = Math.round((bb.top + bb.height * 0.5) - (b.top + b.height * 0.5)) + 'px';
				var x = Math.round((bb.left + bb.width * 0.5) - (b.left + b.width * 0.5)) + 'px';
				
				c.style.transform = 'translate('+x+', '+y+') scale(0)';
				
				setTimeout(function() { dlg.addClass('active'); }, 20);
				setTimeout(function() {
					c.style.transition = 'all 0.4s ease-in-out';
					
					resolve(dlg);
				}, 500);
			});
		},
		hide: function(dlg) {
			return new Promise(function(resolve, reject) {
				var src = dlg.mdDlgSrc || dlg;
				var c = dlg.$('.content');
				var b = c.getBoundingClientRect();
				
				var bb;
				if (src instanceof MouseEvent) {
					bb = {top: src.clientY, height: 0, left: src.clientX, width: 0};
				} else {
					bb = src.getBoundingClientRect();
				}
				
				var y = Math.round((bb.top + bb.height * 0.5) - (b.top + b.height * 0.5)) + 'px';
				var x = Math.round((bb.left + bb.width * 0.5) - (b.left + b.width * 0.5)) + 'px';
				
				c.style.transform = 'translate('+x+', '+y+') scale(0)';
				
				dlg.delClass('active');
				setTimeout(function() {
					dlg.delClass('preactive');
					c.style.transform = '';
					c.style.transition = '';
					
					resolve(dlg);
				}, 400);
			});
		}
	},
	
	menu: {
		init: function(menus) {
			if (menus instanceof Element) {
				menus = [menus];
			}
			menus.forEach(function(menu) {
				menu.show = function() {
					return this.show(menu);
				}.bind(this);
				menu.hide = function() {
					return this.hide(menu);
				}.bind(this);
				menu.addEventListener('click', menu.hide);
				menu.$('.content').addEventListener('click', function(evt) { evt.stopPropagation(); });
			}.bind(this));
		},
		show: function(menu) {
			return new Promise(function(resolve, reject) {
				menu.addClass('preactive');
				
				setTimeout(function() {
					// $('#app').style.transform = 'translateX(' + menu.$('.content').offsetWidth + 'px' + ')';
					menu.addClass('active');
				}, 20);
				setTimeout(function() { resolve(menu); }, 420);
			});
		},
		hide: function(menu) {
			return new Promise(function(resolve, reject) {
				// $('#app').style.transform = '';
				menu.delClass('active');
				setTimeout(function() {
					menu.delClass('preactive');
					resolve(menu);
				}, 400);
			});
		}
	},
	
	tabbar: {
		init: function(bars) {
			if (bars instanceof Element) {
				bars = [bars];
			}
			bars.forEach(function(bar) {
				var items = bar.$$('.item');
				for (var i=0;i<items.length;i++) {
					items[i].style.width = Math.floor(100 / items.length * 1000) / 1000 + '%';
					(function(i){
						items[i].addEventListener('click', function() {
							bar.switchTo(items[i]);
						});
					})(i);
				}
				bar.$('.marker').style.width = Math.floor(100 / items.length * 1000) / 1000 + '%';
				
				this.switchTo(bar, bar.$('.active'));
				
				bar.switchTo = function(tab) {
					return this.switchTo(bar, tab);
				}.bind(this);
			}.bind(this));
		},
		switchTo: function(tabs, tab) {
			return new Promise(function(resolve, reject) {
				var items = tabs.$$('.item');
				for (var i=0;i<items.length;i++) {
					items[i].delClass('active');
				}
				tab.addClass('active');
				var b = tab.getBoundingClientRect();
				tabs.$('.marker').style.left = tab.offsetLeft + 'px';
				var content = tab.getAttribute('data-content');
				if (content) {
					content = $('#' + content);
					content.parentNode.style.transform = 'translateX(' + (content.parentNode.children.lastIndexOf(content)*100) + '%)';
				}
				
				setTimeout(function() { resolve(tabs); }, 400);
			});
		}
	},
	
	ripple: {
		init: function(btns) {
			if (btns instanceof Element) {
				btns = [btns];
			}
			btns.forEach(function(btn) {
				btn.ripple = function(evt) {
					this.ripple(btn, evt);
				}.bind(this);
				btn.rippleEl = document.createElement('div');
				btn.rippleEl.addClass('ripple');
				btn.appendChild(btn.rippleEl);
				btn.addEventListener('click', btn.ripple);
			}.bind(this));
		},
		ripple: function(btn, evt) {
			return new Promise(function(resolve, reject) {
				btn.rippleEl.style.top = evt.pageY - btn.getBoundingClientRect().top - 250 + 'px';
				btn.rippleEl.style.left = evt.pageX - btn.getBoundingClientRect().left - 250 + 'px';
				btn.addClass('clicked'),
					setTimeout(function() {
						btn.delClass('clicked');
						resolve(btn);
					}, 550);
			});
		}
	},
	
	progress: {
		bar: {
			init: function(bars) {
				if (bars instanceof Element) {
					bars = [bars];
				}
				bars.forEach(function(bar) {
					bar.progress = function(prog) {
						this.progress(bar, prog);
					}.bind(this);
					bar.getProgress = function() {
						return this.getProgress(bar);
					}.bind(this);
				}.bind(this));
			},
			progress: function(bar, prog) {
				bar.$('.inner').style.width = prog + '%';
			},
			getProgress: function(bar) {
				return bar.$('.inner').style.width.replace('%','') * 1;
			}
		}
	},
	
	input: {
		init: function(inps) {
			if (inps instanceof Node) {
				inps = [inps];
			}
			inps.forEach(function(inp) {
				inp.input = inp.$('input');
				var plc = document.createElement('div');
				plc.addClass('placeholder');
				plc.textContent = inp.input.placeholder;
				plc.style.font = window.getComputedStyle(inp.input).font;
				plc.addEventListener('click', function() { inp.input.focus(); });
				inp.appendChild(plc);
				inp.input.placeholder = '';
				if (inp.input.type.search(/^(range|date)$/) != -1) {
					inp.addClass('no-placeholder');
				}
				
				inp.input.addEventListener('focus', function() {
					this.focus(inp);
				}.bind(this));
				inp.input.addEventListener('blur', function() {
					this.blur(inp);
				}.bind(this));
				this.focus(inp);
				this.blur(inp);
			}.bind(this));
		},
		focus: function(inp) {
			inp.addClass('focus');
		},
		blur: function(inp) {
			if (inp.input.value.trim() != '' || inp.input.validity.badInput) {
				inp.addClass('has-content');
			} else {
				inp.delClass('has-content');
			}
			inp.delClass('focus');
		}
	}
}
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
		var Data = (function() {
	//
	// vars
	//
	var module = {};
	
	
	//
	// methods
	//
	
	// constructor
	function Data() {
		getData();
	}
	
	function getData() {
		get('data.json').then(JSON.parse).then(gotData.bind(this));
	}
	function gotData(data) {
		module.raiseEvent('update', data);
		setTimeout(getData.bind(this), 1000);
	}
	
	
	
	Data();
	return module;
});
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
		element.innerHTML = '<div><div class=\"header\"><div class=\"title\"></div><ul class=\"actions\"><li class=\"config\" title=\"Configure Widget\"></li><li class=\"close\" title=\"Remove Widget\"></li></ul></div><div class=\"content\"></div></div>';
		element.addClass('widget');
		setTitle(config.title || config.id.join(' - '));
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
		element.$('.content').innerHTML = '<div class=\"canvas\"><canvas width=\"400\" height=\"300\"></canvas></div><div class=\"resizer\"></div>';
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
		element.$('.content').innerHTML = '<div class=\"value\"><span class=\"leading\"></span><span class=\"current\"></span></div>';
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
			sensor = {Value: now.getHours()+','+now.getMinutes()};
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
	
	
	//
	// methods
	//
	
	// constructor
	function WidgetDlg() {
		element = document.createElement('div');
		element.innerHTML = '<div class=\"dialog\" id=\"dlg-widget\"><div class=\"height\"></div><div class=\"content\"><div class=\"title\">Configure Widget</div><div><select id=\"dlg-widget-sensor\"><option value=\"\">Select a Sensor</option></select></div><div><div class=\"input\"><input type=\"text\" id=\"dlg-widget-title\" class=\"long\" placeholder=\"Title\"></div></div><div><label for=\"dlg-widget-type-graph\"><input type=\"radio\" id=\"dlg-widget-type-graph\" name=\"dlg-widget-type\"> Graph</label><label for=\"dlg-widget-type-value\"><input type=\"radio\" id=\"dlg-widget-type-value\" name=\"dlg-widget-type\"> Value</label></div><div id=\"dlg-widget-graph\"><div><div class=\"input\"><input type=\"text\" id=\"dlg-widget-graph-lineColor\" placeholder=\"Line Color\" value=\"#cfcfcf\"><input type=\"color\" id=\"dlg-widget-graph-lineColor-picker\" value=\"#cfcfcf\"></div><div class=\"input\"><input type=\"number\" min=\"0\" max=\"100\" id=\"dlg-widget-graph-lineColor-opacity\" placeholder=\"Opacity\" value=\"50\"></div></div><div><div class=\"input\"><input type=\"text\" id=\"dlg-widget-graph-fillColor\" placeholder=\"Fill Color\" value=\"#e6e6e6\"><input type=\"color\" id=\"dlg-widget-graph-fillColor-picker\" value=\"#e6e6e6\"></div><div class=\"input\"><input type=\"number\" min=\"0\" max=\"100\" id=\"dlg-widget-graph-fillColor-opacity\" placeholder=\"Opacity\" value=\"50\"></div></div><div><div class=\"input\"><input type=\"number\" id=\"dlg-widget-graph-history\" placeholder=\"History [s]\" value=\"15\"></div></div><div><div class=\"input\"><input type=\"number\" id=\"dlg-widget-graph-max\" placeholder=\"Max. Value (0=auto)\" value=\"0\" step=\"0.1\"></div></div></div><div id=\"dlg-widget-value\" class=\"hidden\"><div><div class=\"input\"><input type=\"number\" id=\"dlg-widget-value-fontSize\" placeholder=\"Font Size\" value=\"32\"></div></div><div><div class=\"input\"><input type=\"text\" id=\"dlg-widget-value-color\" placeholder=\"Color\" value=\"#000000\"><input type=\"color\" id=\"dlg-widget-value-color-picker\" value=\"#000000\"></div><div class=\"input\"><input type=\"number\" min=\"0\" max=\"100\" id=\"dlg-widget-value-color-opacity\" placeholder=\"Opacity\" value=\"50\"></div></div><div><div class=\"input\"><input type=\"text\" id=\"dlg-widget-value-format\" placeholder=\"Number Format\" value=\"0.0 $unit\"></div></div></div><div class=\"actions\"><button id=\"dlg-widget-ok\">OK</button><button id=\"dlg-widget-cancel\">Cancel</button></div></div></div>';
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
			dlg.$('#dlg-widget-title').value = _sensor.$(':checked').dataId.join(' - ');
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
			_sensor.disabled = true;
			_type.graph.disabled = true;
			_type.value.disabled = true;
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
		var SettingsDlg = (function() {
	//
	// nodes
	//
	var _grid;
	var _gridSize;
	var _gridColor;
	var _gridColorPicker;
	var _gridColorOpacity;
	var _gridShow;
	
	//
	// vars
	//
	var element;
	var dlg;
	
	
	//
	// methods
	//
	
	// constructor
	function SettingsDlg() {
		element = document.createElement('div');
		element.innerHTML = '<div class=\"dialog\" id=\"dlg-settings\"><div class=\"height\"></div><div class=\"content\"><div class=\"title\">Settings</div><div><div><label for=\"dlg-settings-grid\"><input type=\"checkbox\" id=\"dlg-settings-grid\" placeholder=\"Snap to Grid\" checked> Snap to Grid</label></div></div><div><div class=\"input\"><input type=\"number\" id=\"dlg-settings-gridSize\" placeholder=\"Grid Size\" value=\"10\"></div></div><div><div><label for=\"dlg-settings-gridShow\"><input type=\"checkbox\" id=\"dlg-settings-gridShow\" placeholder=\"Show Grid\" checked> Show Grid</label></div></div><div><div class=\"input\"><input type=\"text\" id=\"dlg-settings-gridColor\" placeholder=\"Grid Color\" value=\"#000000\"><input type=\"color\" id=\"dlg-settings-gridColor-picker\" value=\"#000000\"></div><div class=\"input\"><input type=\"number\" min=\"0\" max=\"100\" id=\"dlg-settings-gridColor-opacity\" placeholder=\"Opacity\" value=\"50\"></div></div><div class=\"actions\"><button id=\"dlg-settings-ok\">OK</button><button id=\"dlg-settings-cancel\">Cancel</button></div></div></div>';
		$('#app').appendChild(element);
		dlg = element.children[0];
		
		_grid = dlg.$('#dlg-settings-grid');
		_gridSize = dlg.$('#dlg-settings-gridSize');
		_gridColor = dlg.$('#dlg-settings-gridColor');
		_gridColorPicker = dlg.$('#dlg-settings-gridColor-picker');
		_gridColorOpacity = dlg.$('#dlg-settings-gridColor-opacity');
		_gridShow = dlg.$('#dlg-settings-gridShow');
		
		dlg.$('#dlg-settings-ok').addEventListener('click', ok);
		dlg.$('#dlg-settings-cancel').addEventListener('click', function() {
			dlg.hide();
		});
		
		_gridColor.addEventListener('change', function() {
			_gridColorPicker.value = this.value;
		});
		_gridColorPicker.addEventListener('change', function() {
			_gridColor.value = this.value;
		});
	}
	
	function show(evt) {
		var colorParts = Config.gridColor.match(/[0-9\.]+/g);
		_grid.checked = Config.grid;
		_gridSize.value = Config.gridSize;
		_gridColor.value = '#' + ("00"+parseInt(colorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[2]).toString(16)).slice(-2);
		_gridColorPicker.value = _gridColor.value;
		_gridColorOpacity.value = parseFloat(colorParts[3])*100;
		_gridShow.checked = Config.showGrid;
		dlg.show(evt);
	}
	
	function ok() {
		var parts = _gridColor.value.substring(1).match(/.{2}/g);
		var opacity = _gridColorOpacity.value;
		var gridColor = 'rgba(' + parseInt(parts[0],16) + ',' + parseInt(parts[1],16) + ',' + parseInt(parts[2],16) + ',' + (opacity/100) + ')';
		module.raiseEvent('change', {
			grid: _grid.checked,
			gridSize: parseInt(_gridSize.value),
			gridColor: gridColor,
			showGrid: _gridShow.checked
		});
		dlg.hide();
	}
	
	
	
	SettingsDlg();
	var module;
	return module = {
		show: show
	};
});
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
		document.body.parentNode.innerHTML = '<head><title>OHM Dashboard</title><link rel=\"shortcut icon\" type=\"image/png\" href=\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAMAAAAoLQ9TAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAMAUExURRIRDRMSExQUFBUVFRcXFxoZER8dER8dExgYGBkZGRkYGhoaGhsbGxscHR8eGxwcHB0dHR0dHh4eHR0eHh4fIiIfFyMiHCgmGiwpHS0rHy4sHjw3GTw3GiIjJCYlISQkJCUkJSYmJicnKCgnIignJSkoISkoJS8uJygoKCkpKSgpLCoqLiwsLCwtLS4uLi4vLy8vMDAtITEwKTw4IjAwMDAxMzIzMjIyMzU1NTU1NzY2NzQ3Pzk5OTo7Ozo6PDw8PDw8PT4/RkA5GktCHlhRMVtWNlhSOnhsLkFBQUJCQkNDQ0RERERFRUdGR0hISElJSUtLS01NTExMTU5OTlVUSlxaTVBQUFFSUlNSU1NVVVVVVVZVVlVVV1ZWVlhYWFpZWlpaWVpaWlpaW1xcXF5eXmpjQGBgYGJhYWBgY2JiYmNjY2RkZGVlZWZlZmdnZ2hnZ2pqamtra25ubm9vb3Bvb3FxcXJycnJydXd4d3p6enx7e39/f7SXEICBgYSEhIWFhYaGhomJiYqLioyMjI6Pjo+Pj5GRk5OTkZSUlJaWlpiYmJmYmZubm56enZ+fn6CgoKKhoaKioqSjo6SjpKampqmpqaurq6usrK6urq+vr6+wsLCwsLCwsrCws7KysLGysbKysrOzs7KytLSztLS0tLS0tba2trO0ubi4t7i4uLq6urm6vLy8vL6+vri6w7/AwMDAwMHBwcTExMbGxsfGx8rKyszMzM3NzdHR0dLS0tPS09XV1dfW19nZ2dra2tzc3N/f4eHh4ePl4+jo6PLx8gAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEuvGkoAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjVJivzgAAABG0lEQVQoUwEQAe/+AHlwbGdjXlhSTUlAOTQyJL4AclpXUEtIQDw4Ny8qJ0MxqwB0X1daZmJZU01IPTAoMxqdAHNeYLG7r6WVjIR/dSsZGKIAc11vwcS9t7Cek4uANBMSowByW228w7q0qpaNiH0sEQ2hAHFYa7nCtqyblIyGeygTDKAAblZptb+0pZWOioR6IBAJoABqUmSwuK2ZkouHgnggDwigAGROYaWzppeQiYN+dh8MBKAAYkxemK2alY+IgX11HwsDoABcQU+RmI6KhX55d2gUCgKgAFVGO01RSj86LygmIxYOAZ8AZXxENS0pIiEdJRwbQhsFnABUR0U+OjYuKSAeFxUHBgCZAMCup6mopqalpKKdnJycmbL69GWV2M35cAAAAABJRU5ErkJggg==\" /><style type=\"text/css\">html, body {height: 100%;margin: 0;overflow: hidden;padding: 0;}body {background-color: rgb(29, 29, 29);font-family: Helvetica, sans-serif;}ul {margin: 0;padding: 0;}.hidden {display: none;}input.long {width: 500px;}.dialog {  background-color: rgba(0, 0, 0, 0);  bottom: 0;  display: none;  left: 0;  position: fixed;  right: 0;  text-align: center;  top: 0;  transition: 250ms;  white-space: nowrap;  z-index: 5;}.dialog .height {  height: 100%;  display: inline-block;  vertical-align: middle;  width: 0;}.dialog .content {  box-shadow: 0 19px 60px rgba(0, 0, 0, 0.3);  box-sizing: border-box;  background: #ffffff;  display: inline-block;  max-height: 100%;  overflow-x: hidden;  overflow-y: auto;  padding: 17px;  text-align: left;  vertical-align: middle;  white-space: normal;}.dialog .content .title {  color: #616161;  font-size: 1.25em;  font-weight: bold;  margin: 0.5em 0;}.dialog .content .actions {  text-align: right;}.dialog.preactive {  display: block;}.dialog.active {  background-color: rgba(0, 0, 0, 0.3);}.dialog.active .content {  transform: translate(0, 0) scale(1) !important;  transition: all 0.4s ease-in-out;}.menu {  background-color: rgba(0, 0, 0, 0);  bottom: 0;  display: none;  left: 0;  position: fixed;  right: 0;  top: 0;  transition: 250ms linear;  z-index: 4;}.menu .content {  box-shadow: 0 14px 45px rgba(0, 0, 0, 0.25);  background-color: #ffffff;  bottom: 0;  left: 0;  position: absolute;  top: 0;  transform: translatex(-100%);  transition: all 0.4s ease-in-out;}.menu .content .title {  background-color: rgb(1, 87, 155);  color: #ffffff;  font-size: 1.25em;  font-weight: normal;  margin: 0 0 0.5em 0;  padding: 1em 0.5em;}.menu .content .items {margin: 0;padding: 0;}.menu .content .items .item {  margin: 0.5em 0;  overflow: hidden;  position: relative;}.menu .content .items .item .item-link, .menu .content .items .item .item-link * {  cursor: pointer;}.menu .content .items .item .item-link {  display: block;  padding: 1em 1.25em;  transition: 250ms;}.menu .content .items .item .item-link:hover {  background-color: rgba(0, 0, 0, 0.12);}.menu.preactive {  display: block;}.menu.active {  background-color: rgba(0, 0, 0, 0.3);}.menu.active .content {  transform: translatex(0);}.input {  display: inline-block;  font-size: 1em;  position: relative;}.input input {  border: none;  border-bottom: 1px solid #e0e0e0;  color: #616161;  font: inherit;  margin: 1em 0 0 0;  outline: none;  transition: 250ms ease-in-out;}.input input:focus {  border-bottom-color: rgb(1, 87, 155);}.input input:invalid {  border-color: #e51c23;}.input .placeholder {  position: absolute;  top: 1em;  left: 0;  color: #bdbdbd;  transition: 250ms ease-in-out;}.input.focus .placeholder {  top: 0;  font-size: 0.75em !important;  color: rgb(1, 87, 155);}.input.has-content .placeholder,.input.no-placeholder .placeholder {  top: 0;  font-size: 0.75em !important;}.ripple {  content: \"\";  background-color: rgba(0, 0, 0, 0.4);  border-radius: 50%;  display: block;  height: 500px;  left: 0;  opacity: 1;  position: absolute;  top: 0;  transform: scale(0);  width: 500px;}.clicked .ripple {  opacity: 0;  transform: scale(1);  transition: transform 550ms ease-in-out, opacity 550ms ease-in-out;}button,input[type=\"button\"],input[type=\"submit\"] {  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);  background-color: rgb(1, 87, 155);  border: none;  color: white;  cursor: pointer;  font: inherit;  margin: 1em;  outline: none;  overflow: hidden;  padding: 0.5em;  position: relative;  transition: 200ms linear;  vertical-align: bottom;  width: 10em;}button:hover,input[type=\"button\"]:hover,input[type=\"submit\"]:hover {  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.16);  background-color: rgb(2, 119, 189);  transform: translate3d(0, -1px, 0);}.toasts {list-style: none;margin: 0;padding: 0;position: absolute;right: 2.5em;top: 2.5em;width: 20em;}.toast {background-color: rgb(255,255,255);border-top: 0.5em solid rgb(1, 87, 155);box-shadow: 0 1px 4px rgba(0, 0, 0, 0.24);box-sizing: border-box;margin: 0;opacity: 0;padding: 0.5em;}.toast.preactive {transition: 200ms ease-in-out;}.toast.active {margin-top: 0.5em !important;opacity: 1;}.toast > .title {font-weight: bold;}.toast > .info {font-size: small;}.toolbar {  height: 2.5em;  position: relative;}.toolbar .sect {  height: 100%;  position: absolute;  top: 0;}.toolbar .sect .item {  box-sizing: border-box;  display: inline-block;  height: 100%;  margin: 0 0.5em;  overflow: hidden;  position: relative;}.toolbar .sect .item .item-link {  box-sizing: border-box;  color: inherit;  cursor: pointer;  display: block;  font-size: 1.25em;  height: 100%;  padding: 0.45em 0.5em 0.25em 0.5em;  text-decoration: none;}.toolbar .sect .item .item-link:hover {  background-color: rgba(0, 0, 0, 0.12);}.toolbar .sect.primary {  left: 0;}.toolbar .sect.secondary {  right: 0;}.tabbar {  height: 2.5em;  position: relative;}.tabbar .items {  height: 100%;}.tabbar .items .item {  box-sizing: border-box;  display: inline-block;  height: 100%;  overflow: hidden;  position: relative;}.tabbar .items .item .item-link {  background-color: #03a9f4;  box-sizing: border-box;  color: #ffffff;  cursor: pointer;  display: block;  font-size: 1.25em;  height: 100%;  padding: 0.25em 0.5em 0.375em 0.5em;  text-align: center;}.tabbar .marker {  background-color: #ffeb3b;  bottom: 0;  height: 0.25em;  position: absolute;  transition: 400ms ease-in-out;}.tabbar.bottom .items .item .item-link {  padding: 0.375em 0.5em 0.25em 0.5em;}.tabbar.bottom .marker {  bottom: auto;  top: 0;}#app {position: absolute;top: 0;bottom: 0;right: 0;left: 0;/*transition: 400ms ease-in-out;*/}.appBtn {box-shadow: 0 3px 10px rgba(0,0,0,0.16);background-color: rgba(224, 224, 224, 0.25);border-radius: 50%;cursor: pointer;font-size: 47px;font-weight: bold;height: 50px;position: absolute;right: 10px;text-align: center;transition: 200ms;width: 50px;z-index: 2;}.appBtn:hover {box-shadow: 0 4px 30px rgba(0,0,0,0.16);background-color: rgba(238, 238, 238, 0.5);transform: translate3d(0, -1px, 0);}#new {top: 10px;}#settings {background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAYAAAAeP4ixAAAFsUlEQVRoge2Yf0yTRxjHn5bXtpQKLdbICpoOGAWCpEorogjo0C3AJmECi04FEpnT2WLcAttE3UjmwMVJkfgrOqpgpjEBRc1kIq3U6XBS1lgXnYmvs8YfC70OC9hWevtDKaWUUuRHk6Wf5JJ77+69fL+5u/d57gXw4sWLFy9evPx/oLzOSwghVtv168TVa9cAACAkOBhEcXEvhEKhcVzVjYJRGamRy7kajUYkFArLdDqd6M/btwEAgDttGgTzeJpWlaq4dOtWCAsNvcThcMwTonistCiVjKq9e48lLV6MWQEBmKDRBgqdjulMJo6KicGbpFJ88NChrZOtz8fdgfn5+cBgMARGo/FtrVYLZosFgEJ5WQAAW62g1+tBrVYDef/+grT09D51e7tqwpSPhXv37hGVMhm7Ri7/URwf3+fn748JOt22Kvb1N8PDTavXrt22RyZjeFq3S7RabfX7mZmtguhoTPP1HWKEoNPx/IUL8ZnGxjJPax0RhVIZcayuTvlBdvag89JfpzOZuHzXLuxpnW6BEAr5fvfueV+VlvZyuFyLvRGCTsdRMTG4o6OD5mmRc0cznqDRSmxbzG6bqVSqqxOlsR/qcB0kSa6sPX68vuH06WVuz0axC0sY255vqNWvr9BNhjXy5OnTdd+Vl8+qrKo6cPbcuXqEUIiriRBCMYXr1q121mcwGMaqc0SGNcLn8x8jhODXK1f46zdsyNxbXd0qLSrikyTJdjZee+sWFwCiAWDQagDGoNPpGPv27+fr9Xrm+Ft4icsUZXpQUC9CiAEAQKVSYWlqKmSkp58ym82bpBLJ4/5x8qNHqcbu7u3nz5/fdqGp6aURAJsZPz8/+DAnB8Risay7u/sLqUTSM1GGnLJy1ape+4M7hcHAEZGReElqav3NmzdLAADkcvmKxKSkqgWLFmFbgHRS6Ewmjp0zB2dmZR0mSbJgUo00nj3b6+fvPyRyT2WzcUJiYu+KnJyrbwkETwICA4c14PgF486YgbNzczsrZbI146nV5db6uqwsoq2t7cLF5mZ+X1/fQAe2i3EUJ1P0nxGHs2Jfn8blwqaNG4Hq4yP+sqTk97EacZk0KlpaOvPy8kwWiyXj4cOHgK3WATF2CaNNqLP2fhwM9fb0gEKpBKBQMtLS0qwVFRVdNTU1/4zV0LAghMIvNDUp5yUkOE8Q7Z+dtTvWHcbQmUwsiI7GH61Z89udO3cOv65Oty5WCCHup1JpkLWvT3m5tTXQYDCAyWQatAoEQQCTyYSQ4GBDd0+Pv06nozrdjo5b7lUfw9cXZs+ebZVKJCcB483vLFumH83lbFQ3RL1eP/cPjab0wMGDcKmlxT82NnaJ2WwGrVarCAsLM6wvLIQ5QuFOi8XyyWfFxTEkSYoePXo0eEs6nh8HU4EcDuTn54NYJPqGIIiyzOXLX4y7EXtIkgx8ZjQWdnZ2AgAcSUlOfmrf39DQEPm3Tneovr4+sVWlGroi/XUn+Pj4QML8+RApEOwpKS6+wufzT02YEXdACIV/u3NnyHOTqaW2rg6edXUNK34IGMMbPB6kJCc/FsXFfSyVSM5MpFa3IElSdKaxUZ2YlIRYAQHDxphB/wFetU1hMPBckchSXlGxwtM+bCgUioLPi4ufRURFOb1Rugqmx2pre13NTUyWCQCAlJSUIw8ePOiaymItutHeLrnY3Aym588HBjh+zfqhUIDNdpqr2phUIwAAM2fOPNXR0fGz2WLZx+Pxqk+cPLnEaDSC1dmX7RXhYWGg0WhyJ1vrqFAqlafjExK004OCnJ6TqWw23rxli1ahUIR6WuuIVMpkou07dqjF8fFDMubMrCz804kT6z2t0W1IkoyRFBVl5RUUYF8WCxM0Gs7OzcXKy5d/QQjNGun9CY0jo6WhoQEEAsG7/3Z1/YCtVvjr7t2l72Vk6DkczuRexLx48eLFixcvHuY/nQa0VsCJ2IsAAAAASUVORK5CYII=\");top: 80px;}#widgets {position: relative;}.widget {background-color: rgba(255,255,255, 0);/*box-shadow: 0 1px 4px rgba(0,0,0,0.16);*/min-height: 40px;overflow: hidden;position: absolute;transition: background-color ease-in-out 200ms;min-width: 60px;}.widget:hover, .widget.hovered {background-color: rgba(255,255,255, 0.5);}.widget.top {z-index: 1;}.widget .header {color: rgb(115, 115, 90);cursor: move;font-weight: bold;height: 20px;margin-bottom: 5px;position: relative;}.widget .header > .title {height: 18px;overflow: hidden;padding: 2px 50px 0 10px;text-overflow: ellipsis;white-space: nowrap;}.widget .header > .actions {position: absolute;right: 0;top: 0;}.widget .header > .actions > li {cursor: pointer;display: inline-block;height: 20px;margin-left: 2px;width: 20px;}.widget .header > .actions > .close {background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjVJivzgAAAA30lEQVQ4T9WUQQqDMBBFhdxAg5tk5w1ciguP4qL3LyJdlna+ycg0xGS6az98osn8NyhDmr+WjWtOfVx1MsasXddt9DiHnQ/NOKOaW3wvC7BhGJ7jOL6cczttSejsvd9xhpoqVMLYAnrC2DVoS59ylwE2oCmMba1Fw8t/OlF4ywVzpiYPyiwhei0VVAtjFaHfwqAFoRwMRjOqmUJpXUUYWwtVwdg1aI8RyAWpyU7h7BlGjbJtQCTCkKaDDRgdHYOdQuNgr0f4ShIqYKwTqoKxAFVcDjqYUOmKKl1tP62meQNRWMNDZctVeQAAAABJRU5ErkJggg==\");}.widget .header > .actions > .config {background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABk0lEQVQ4jWNgGAWUAkZ0gYWLFkkcPHQo/9GjRxIiIiI3y8vKVhkaGNwj24aJkyZ5qWlo3GXl4PjPws7+X05B4XVAUJAeRc6+evWqRFRMzHxhMbGfLOzs/y2trV+TbMiuXbvUVq5aJYcspmdg4MfCxvaflYPj/+o1axyIMYcJxjh0+LBbQ2Pj+dKysiSYmL+/vwYDIyPD/3//GE6cPGlBkgt7+/oMxCQl/3Pz8f13dHHZ7OTqWiSnoPCShZ39Pws7+38+QcH/Hl5eKydMmsRHtKG+/v6L2Tg5/7Ows/9nYWNDpaFYVUPjY3RcXNitW7fYCBr4/v17gdDw8G4ZefmHkjIyvxVVVO5b2dgc5+Hn/4tsKBcv7393L6/9GzZu1CHKpQ8ePGA6efKkFoxfUloap2do+JGFje0/MpaVl38bl5CQRXQQIINly5dLRURFbRYUEUEJBjlFxd+XL1/WImwCFnDhwgWmrJwcNzVNzbswAw2NjU++e/eOibBuPODBgwciMXFxs908PC5u3bbNgSLDRgEGAADSHpQeJbnt6wAAAABJRU5ErkJggg==\");}.widget .canvas {bottom: 0;left: 0;position: absolute;right: 0;top: 25px;}.widget .value {text-align: right;}.widget .value > .leading {opacity: 0;}.widget .resizer {background-color: rgba(140,140,140, 0.5);bottom: 0;cursor: se-resize;height: 10px;opacity: 0;position: absolute;right: 0;width: 26px;background-image: repeating-linear-gradient(0deg, rgba(0, 0, 0, 1), rgba(0, 0, 0, 1) 1px, rgba(255, 255, 255, 0) 1px, rgba(255, 255, 255, 0) 3px);transform: rotate(-45deg) translateX(4px) translateY(6px);}.widget:hover .resizer {opacity: 1;}.shake {animation: shake 0.82s cubic-bezier(.36,.07,.19,.97) both;transform: translate3d(0, 0, 0);backface-visibility: hidden;perspective: 1000px;}select.error { border-color: red; }@keyframes shake {10%, 90% {transform: translate3d(-1px, 0, 0);}20%, 80% {transform: translate3d(2px, 0, 0);}30%, 50%, 70% {transform: translate3d(-4px, 0, 0);}40%, 60% {transform: translate3d(4px, 0, 0);}}</style></head><body><div id=\"app\"><div class=\"appBtn\" id=\"new\" title=\"Add Widget\">+</div><div class=\"appBtn\" id=\"settings\" title=\"Settings\"></div><div id=\"widgets\"></div></div></body>';
		
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
		var bg = getComputedStyle(document.body).backgroundColor;
		$('#app').style.backgroundColor = Config.gridColor;
		$('#app').style.backgroundImage = 'repeating-linear-gradient(rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, ' + bg + ' 1px, ' + bg + ' ' + Config.gridSize + 'px),\
					repeating-linear-gradient(90deg, rgba(0, 0, 0, 0), rgba(0, 0, 0, 0) 1px, ' + bg + ' 1px, ' + bg + ' ' + Config.gridSize + 'px)';
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
		
		
		//
		// VARS
		//
		function init() {
			var dashboard = new OHMDashboard();
		}
		init();
	}
})();