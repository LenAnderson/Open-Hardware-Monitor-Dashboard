import { log } from "../lib/basics.js";
import { ChartWidgetDialog } from "./ChartWidgetDialog.js";
import { ChartWidgetPreferences } from "./ChartWidgetPreferences.js";
import { Widget } from "./Widget.js";

export class ChartWidget extends Widget {
	chart;

	/**@type{Number}*/ #width = 0;
	get width() { return this.#width; }
	set width(value) {
		if (this.#width != value) {
			if (this.prefs.snapToGrid) {
				value = Math.round(value/this.prefs.gridSize) * this.prefs.gridSize;
			}
			this.#width = value;
			if (this.dom) this.dom.style.width = `${value}px`;
		}
	}
	/**@type{Number}*/ #height = 0;
	get height() { return this.#height; }
	set height(value) {
		if (this.#height != value) {
			if (this.prefs.snapToGrid) {
				value = Math.round(value/this.prefs.gridSize) * this.prefs.gridSize;
			}
			this.#height = value;
			if (this.dom) this.dom.style.height = `${value}px`;
		}
	}

	/**@type{Number}*/ history = 120;
	
	
	/**@type{Number}*/ #max = null;
	get max() { return this.#max; }
	set max(value) {
		if (this.#max != value) {
			this.#max = value;
			if (this.chart) this.chart.options.scales.yAxis.suggestedMax = value;
		}
	}

	/**@type{String}*/ #lineColor;
	get lineColor() { return this.#lineColor; }
	set lineColor(value) {
		if (this.#lineColor != value) {
			this.#lineColor = value;
			if (this.chart) this.chart.data.datasets[0].borderColor = `rgba(${value.join(', ')})`;
		}
	}
	
	/**@type{String}*/ #fillColor;
	get fillColor() { return this.#fillColor; }
	set fillColor(value) {
		if (this.#fillColor != value) {
			this.#fillColor = value;
			if (this.chart) this.chart.data.datasets[0].backgroundColor = `rgba(${value.join(', ')})`;;
		}
	}

	/**@type{Boolean}*/ isResizing = false;
	resizeOrigin = {
		left: 10,
		top: 10,
		width:400,
		height:300
	};

	data;




	constructor(
		/**@type{Preferences}*/prefs,
		/**@type{PixelService}*/pixel,
		{
			/**@type{String}*/sensor,
			/**@type{String}*/name,
			/**@type{Number}*/left=0,
			/**@type{Number}*/top=0,
			/**@type{Number}*/width=400,
			/**@type{Number}*/height=300,
			/**@type{String}*/lineColor=null,
			/**@type{String}*/fillColor=null,
			/**@type{Number}*/history=120,
			/**@type{Number}*/max=0,
		}
		) {
		super(prefs, pixel, {sensor, name});
		this.buildDom();
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		if (lineColor === null) {
			if (this.sensor.toLowerCase().search('nvidia') != -1) {
				this.lineColor = [118, 185, 0, 0.25];
			} else if (this.sensor.toLowerCase().search('intel') != -1) {
				this.lineColor = [0, 113, 197, 0.25];
			} else {
				this.lineColor = [115, 115, 90, 0.25];
			}
		} else {
			this.lineColor = lineColor;
		}
		if (fillColor === null) {
			if (this.sensor.toLowerCase().search('nvidia') != -1) {
				this.fillColor = [118, 185, 0, 0.125];
			} else if (this.sensor.toLowerCase().search('intel') != -1) {
				this.fillColor = [0, 113, 197, 0.125];
			} else {
				this.fillColor = [115, 115, 90, 0.125];
			}
		} else {
			this.fillColor = fillColor;
		}
		this.history = history;
		this.max = max;
	}


	buildDom() {
		super.buildDom();

		const chartContainer = document.createElement('div'); {
			chartContainer.classList.add('ohmd--widget-chartContainer');
			const canvas = document.createElement('canvas'); {
				canvas.height = '300';
				canvas.width = '400';
				this.chart = new Chart(canvas.getContext('2d'), {
					type: 'line',
					data: {
						labels: [],
						datasets: [{
							fill: true,
							pointRadius: 0,
							data: [],
						}],
					},
					options: {
						animation: false,
						maintainAspectRatio: false,
						scales: {
							yAxis: {
								suggestedMin: 0,
								gridLines: {
									color: 'rgba(50,50,50,0.5)',
								},
							},
							xAxis: {
								gridLines: {
									color: 'rgba(50,50,50,0.5)',
								},
							},
						},
						plugins: {
							legend: {
								display: false,
							},
						},
					},
				});
				chartContainer.append(canvas);
			}
			this.body.append(chartContainer);
		}
		const resizer = document.createElement('div'); {
			resizer.classList.add('ohmd--widget-resizer');
			resizer.addEventListener('pointerdown', (evt)=>this.startResize(evt));
			this.body.append(resizer);
		}
		this.data = this.chart.data.datasets[0].data;
	}




	startResize(/**@type{PointerEvent}**/evt) {
		if (!this.isResizing) {
			evt.preventDefault();
			this.isResizing = true;
			this.dom.classList.add('ohmd--hovered');
			this.resizeOrigin.left = this.left + this.width;
			this.resizeOrigin.top = this.top + this.height;
			this.resizeOrigin.width = this.width;
			this.resizeOrigin.height = this.height;
			this.pointerOffset.left = this.resizeOrigin.left - this.pixel.x(evt.clientX);
			this.pointerOffset.top = this.resizeOrigin.top - evt.clientY;
		}
	}
	resize(/**@type{PointerEvent}**/evt) {
		evt.preventDefault();
		this.width = this.resizeOrigin.width + this.pixel.x(evt.clientX) - this.resizeOrigin.left + this.pointerOffset.left;
		this.height = this.resizeOrigin.height + evt.clientY - this.resizeOrigin.top + this.pointerOffset.top;
	}
	endResize(/**@type{PointerEvent}**/evt) {
		evt.preventDefault();
		this.isResizing = false;
		this.dom.classList.remove('ohmd--hovered');
		this.fireUpdate();
	}


	pointerMove(/**@type{PointerEvent}**/evt) {
		if (this.isResizing) {
			this.resize(evt);
		} else {
			super.pointerMove(evt);
		}
	}
	pointerUp(/**@type{PointerEvent}**/evt) {
		if (this.isResizing) {
			this.endResize(evt);
		} else {
			super.pointerUp(evt);
		}
	}




	async showSettings(/**@type{HTMLElement}*/trigger) {
		const prefs = new ChartWidgetPreferences(this.getConfig());
		const dlg = new ChartWidgetDialog(prefs)
		await dlg.show(trigger);
		if (await dlg.outcome) {
			this.name = dlg.prefs.name;
			this.lineColor = dlg.prefs.lineColor;
			this.fillColor = dlg.prefs.fillColor;
			this.history = dlg.prefs.history;
			this.max = dlg.prefs.max;
			this.fireUpdate();
		}
		dlg.remove();
	}


	getConfig() {
		return {
			type: 'chart',
			sensor: this.sensor,
			name: this.name,
			left: this.left,
			top: this.top,
			width: this.width,
			height: this.height,
			history: this.history,
			max: this.max,
			lineColor: this.lineColor,
			fillColor: this.fillColor,
		}
	}




	setData(data) {
		let item = data;
		for (const part of this.id) {
			item = item.Children.find(it=>it.Text == part);
			if (!item) break;
		}
		if (!item) {
			//TODO error
			error('error')
		} else {
			//TODO data
			this.data?.push(parseFloat(item.Value.replace(',', '.')));
			const labels = [];
			const skip = Math.round(this.history / 15);
			for (let i=-this.history; i<1; i++) {
				if (i%skip == 0) {
					labels.push(i);
				} else {
					labels.push('');
				}
			}
			this.chart.data.labels = labels;
			while (this.data.length < this.history + 1) {
				this.data.unshift(null);
			}
			while (this.data.length > this.history + 1) {
				this.data.shift();
			}
			if (item.Value.search(/%$/) != -1) {
				this.chart.options.scales.yAxis.suggestedMax = 100;
			}
			this.chart.update();
		}
	}
}