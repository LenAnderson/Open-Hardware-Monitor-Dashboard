import { $, $$, wait } from "../lib/basics.js";
import { ChartWidget } from "./ChartWidget.js";
import { PixelService } from "./PixelService.js";
import { Widget } from "./Widget.js";

export class Dashboard {
	/**@type{HTMLDivElement}*/ ohmHeader;
	/**@type{HTMLDivElement}*/ ohmMain;
	
	/**@type{HTMLDivElement}*/ ohmContainer;
	/**@type{HTMLDivElement}*/ ohmContent;
	/**@type{Number}*/ ohmWidth;

	/**@type{HTMLDivElement}*/ container;

	/**@type{Boolean}*/ isOhmShown = false;

	/**@type{PixelService}*/ pixel;

	/**@type{Widget[]}*/ widgets = [];




	constructor() {
		this.buildDom();
		this.pixel = new PixelService(this.container);

		this.modifyOhmDom();
		this.loadWidgets();

		if (this.widgets.length == 0) {
			this.showOhm();
		}

		this.fetchData();
	}


	buildDom() {
		this.ohmHeader = $('.header');
		this.ohmMain = $('.main');
		this.ohmWidth = $(this.ohmMain, '.treeTable').getBoundingClientRect().width + 40 + 15;

		const style = document.createElement('style'); {
			style.innerHTML = '${include-min-esc: ../css/ohmd.css}';
			document.body.append(style);
		}

		const ohm = document.createElement('div'); {
			this.ohmContainer = ohm;
			ohm.classList.add('ohmd--ohmContainer');
			ohm.style.width = `${this.ohmWidth}px`;
			const content = document.createElement('div'); {
				this.ohmContent = content;
				content.classList.add('ohmd--ohmContainer-content');
				ohm.append(content);
			}
			const toggle = document.createElement('div'); {
				toggle.classList.add('ohmd--ohmContainer-toggle');
				toggle.title = 'Show / Hide Sensors'
				toggle.addEventListener('click', ()=>this.toggleOhm());
				ohm.append(toggle);
			}
			document.body.append(ohm);
		}
		this.ohmContent.append(this.ohmHeader);
		this.ohmContent.append(this.ohmMain);

		const container = document.createElement('div'); {
			this.container = container;
			container.classList.add('ohmd--container');
			document.body.append(container);
		}

		this.hideOhm();
	}

	modifyOhmDom() {
		const nodes = {};
		$$(this.ohmMain, '.treeTable > tbody > tr').forEach((/**@type{HTMLElement}*/row)=>{
			const name = row.children[0].textContent.trim();
			const parent = row.className.replace(/^.*?(?:child-of-(node-\d+))?.*$/, '$1');
			let id;
			if (parent) {
				id = `${nodes[parent]}---${name}`;
			} else {
				id = name;
			}
			nodes[row.id] = id;
			row.setAttribute('data-ohmd-id', id);
			if (!row.classList.contains('parent') && row.children[2].textContent.trim() != '' && row.children[2].textContent.trim() != '-') {
				row.children[0].style.position = 'relative';
				const btnChart = document.createElement('button'); {
					btnChart.textContent = '📈';
					btnChart.title = 'Add Chart Widget';
					btnChart.style.position = 'absolute';
					btnChart.style.left = '0px';
					btnChart.style.top = '0px';
					btnChart.style.padding = '0px';
					btnChart.style.width = '22px';
					btnChart.style.height = '21px';
					btnChart.addEventListener('click', ()=>{
						this.addChartWidget(id, name);
					});
					row.children[0].append(btnChart);
				}
				const btnValue = document.createElement('button'); {
					btnValue.textContent = '#';
					btnValue.title = 'Add Value Widget';
					btnValue.style.position = 'absolute';
					btnValue.style.left = '24px';
					btnValue.style.top = '0px';
					btnValue.style.padding = '0px';
					btnValue.style.width = '22px';
					btnValue.style.height = '21px';
					btnValue.addEventListener('click', ()=>{
						this.addValueWidget(id, name);
					});
					row.children[0].append(btnValue);
				}
			}
		});
	}




	async toggleOhm() {
		if (this.isOhmShown) {
			this.hideOhm();
		} else {
			this.showOhm();
		}
	}
	async showOhm() {
		this.isOhmShown = true;
		this.ohmContainer.classList.remove('ohmd--collapsed');
		this.container.classList.add('ohmd--shrunk');
		this.ohmContainer.style.left = `0px`;
		this.container.style.transform = `scaleX(${1.0 - this.ohmWidth / document.body.getBoundingClientRect().width})`;
		await wait(210);
		this.pixel.update();
	}
	async hideOhm() {
		this.isOhmShown = false;
		this.ohmContainer.classList.add('ohmd--collapsed');
		this.container.classList.remove('ohmd--shrunk');
		this.ohmContainer.style.left = `-${this.ohmWidth - 15}px`;
		this.container.style.transform = `scaleX(1.0)`;
		await wait(210);
		this.pixel.update();
	}




	addChartWidget(/**@type{String}*/sensor, /**@type{String}*/name) {
		const widget = new ChartWidget(this.pixel, {sensor, name});
		this.addWidget(widget);
	}
	addValueWidget(/**@type{String}*/sensor, /**@type{String}*/name) {
		const widget = new ChartWidget(this.pixel, {sensor, name});
		this.addWidget(widget);
	}
	addWidget(/**@type{Widget}*/widget) {
		widget.onUpdate = ()=>this.saveWidgets();
		widget.onRemove = (w)=>this.removeWidget(w);
		this.container.append(widget.dom);
		this.widgets.push(widget);
		this.saveWidgets();
	}
	addWidgetFromConfig(config) {
		let widget;
		switch (config.type) {
			case 'chart': {
				widget = new ChartWidget(this.pixel, config);
				break;
			}
			case 'value': {
				break;
			}
		}
		widget.onUpdate = ()=>this.saveWidgets();
		widget.onRemove = (w)=>this.removeWidget(w);
		this.container.append(widget.dom);
		this.widgets.push(widget);
	}

	removeWidget(/**@type{Widget}*/widget) {
		this.widgets = this.widgets.filter(it=>it!=widget);
		this.saveWidgets();
	}


	saveWidgets() {
		localStorage.setItem('ohmd--widgets', JSON.stringify(this.widgets.map(widget=>widget.getConfig())));
	}

	loadWidgets() {
		const configs = JSON.parse(localStorage.getItem('ohmd--widgets') || '[]');
		configs.forEach(config=>this.addWidgetFromConfig(config));
	}




	async fetchData() {
		while (true) {
			const data = await (await fetch('data.json')).json();
			this.widgets.forEach(widget=>widget.setData(data));
			await wait(1000);
		}
	}
}