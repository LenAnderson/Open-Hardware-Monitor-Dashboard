// ==UserScript==
// @name         Open Hardware Monitor - Dashboard
// @banesoace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Open-Hardware-Monitor-Dashboard/raw/master/ohmd.user.js
// @version      2.0
// @author       LenAnderson
// @match        http://localhost:8085
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js
// ==/UserScript==




(function() {
	'use strict';

// ---------------- IMPORTS  ----------------



// src\lib\BindingTarget.js
class BindingTarget {
	/**@type {HTMLElement}*/ target;
	/**@type {String}*/ attributeName;
	/**@type {Function}*/ targetConverter;
	/**@type {Function}*/ sourceConverter;
	constructor(
		/**@type {HTMLElement}*/ target,
		/**@type {String}*/ attributeName,
		/**@type {Function}*/ targetConverter,
		/**@type {Function}*/ sourceConverter
	) {
		this.target = target;
		this.attributeName = attributeName;
		this.targetConverter = targetConverter;
		this.sourceConverter = sourceConverter;
	}
}


// src\lib\Binding.js


class Binding {
	/**@type {Binding[]}*/ static bindings = [];
	/**@type {Object}*/ source;
	/**@type {String}*/ propertyName;
	/**@type {BindingTarget[]}*/ targets = [];
	/**@type {Function}*/ theGetter;
	/**@type {Function}*/ theSetter;
	/**@type {Boolean}*/ isProperty = false;
	value;
	static create(source, propertyName, target, attributeName, targetConverter=v=>v, sourceConverter=v=>v) {
		let binding = this.bindings.find(it=>it.source==source&&it.propertyName==propertyName);
		if (!binding) {
			binding = new Binding(source, propertyName);
			this.bindings.push(binding);
		}
		binding.targets.push(new BindingTarget(target, attributeName, targetConverter, sourceConverter));
		binding.setTargetValue();
		switch (target.tagName) {
			case 'TEXTAREA':
			case 'INPUT': {
				switch (attributeName) {
					case 'value':
					case 'checked': {
						switch (target.type) {
							case 'radio': {
								target.addEventListener('change', ()=>target.checked?binding.setter(target.value):false);
								break;
							}
							default: {
								target.addEventListener('change', ()=>binding.setter(sourceConverter(target[attributeName])));
								break;
							}
						}
						break;
					}
				}
				break;
			}
		}
	}
	constructor(source, propertyName) {
		this.source = source;
		this.propertyName = propertyName;
		
		this.value = this.source[this.propertyName];
		const p = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(source), propertyName);
		if (p) {
			this.isProperty = true;
			this.theGetter = p.get.bind(source);
			this.theSetter = p.set.bind(source);
		} else {
			this.theGetter = ()=>this.value;
			this.theSetter = (value)=>this.value=value;
		}
		Object.defineProperty(source, propertyName, {
			get: this.getter.bind(this),
			set: this.setter.bind(this)
		});
		this.setTargetValue();
	}
	getter() {
		return this.theGetter();
	}
	setter(value) {
		let changed = false;
		if (this.isProperty) {
			this.theSetter(value);
			changed = this.getValueOf(this.value) != this.getValueOf(this.theGetter())
		} else {
			changed = this.theGetter() != value;
		}
		if (changed) {
			this.value = this.isProperty ? this.theGetter() : value;
			this.setTargetValue();
		}
	}
	getValueOf(it) {
		if (it !== null && it !== undefined && it.valueOf) {
			return it.valueOf();
		}
		return it;
	}
	setTargetValue() {
		this.targets.forEach(target=>{
			if (target.attributeName.substring(0,5) == 'data-') {
				target.target.setAttribute(target.attributeName, target.targetConverter(this.theGetter()));
			} else {
				target.target[target.attributeName] = target.targetConverter(this.theGetter());
			}
		});
	}
}


// src\ohmd\Widget.js




class Widget {
	/**@type{String}*/ sensor;
	/**@type{String[]}*/ id;
	/**@type{String}*/ name;
	/**@type{PixelService}*/ pixel;

	/**@type{HTMLDivElement}*/ dom;
	/**@type{HTMLDivElement}*/ body;

	/**@type{Number}*/ #left = 0;
	get left() { return this.#left; }
	set left(value) {
		if (this.#left != value) {
			this.#left = value;
			if (this.dom) this.dom.style.left = `${value}px`;
		}
	}
	/**@type{Number}*/ #top = 0;
	get top() { return this.#top; }
	set top(value) {
		if (this.#top != value) {
			this.#top = value;
			if (this.dom) this.dom.style.top = `${value}px`;
		}
	}

	/**@type{Boolean}*/ isMoving = false;
	pointerOffset = {left:0, top:0};

	/**@type{Function}*/ onUpdate;
	/**@type{Function}*/ onRemove;




	constructor(/**@type{PixelService}*/pixel, {/**@type{String}*/sensor, /**@type{String}*/name, /**@type{Number}*/left=0, /**@type{Number}*/top=0}) {
		this.sensor = sensor;
		this.id = sensor.split('---');
		this.name = name;
		this.pixel = pixel;

		this.left = left;
		this.top = top;
	}


	buildDom() {
		addEventListener('pointermove', (evt)=>this.pointerMove(evt));
		addEventListener('pointerup', (evt)=>this.pointerUp(evt));
		const root = document.createElement('div'); {
			this.dom = root;
			root.classList.add('ohmd--widget');
			const header = document.createElement('div'); {
				header.classList.add('ohmd--widget-header');
				header.addEventListener('pointerdown', (evt)=>this.startMove(evt));
				const title = document.createElement('div'); {
					title.classList.add('ohmd--widget-title');
					Binding.create(this, 'name', title, 'textContent');
					header.append(title);
				}
				const actions = document.createElement('div'); {
					actions.classList.add('ohmd--widget-actions');
					const config = document.createElement('a'); {
						config.classList.add('ohmd--widget-action');
						config.classList.add('ohmd--widget-config');
						config.title = 'Configure Widget';
						config.href = 'javascript:;';
						actions.append(config);
					}
					const remove = document.createElement('a'); {
						remove.classList.add('ohmd--widget-action');
						remove.classList.add('ohmd--widget-remove');
						remove.title = 'Remove Widget';
						remove.href = 'javascript:;';
						remove.addEventListener('click', ()=>this.remove());
						actions.append(remove);
					}
					header.append(actions);
				}
				root.append(header);
			}
			const body = document.createElement('div'); {
				this.body = body;
				body.classList.add('ohmd--widget-body');
				root.append(body);
			}
		}
	}


	startMove(/**@type{PointerEvent}**/evt) {
		if (!this.isMoving) {
			evt.preventDefault();
			this.isMoving = true;
			this.dom.classList.add('ohmd--hovered');
			this.pointerOffset.left = this.left - this.pixel.x(evt.clientX);
			this.pointerOffset.top = this.top - evt.clientY;
		}
	}
	move(/**@type{PointerEvent}**/evt) {
		evt.preventDefault();
		this.left = this.pixel.x(evt.clientX) + this.pointerOffset.left;
		this.top = evt.clientY + this.pointerOffset.top;
	}
	endMove(/**@type{PointerEvent}**/evt) {
		evt.preventDefault();
		this.isMoving = false;
		this.dom.classList.remove('ohmd--hovered');
		this.fireUpdate();
	}


	pointerMove(/**@type{PointerEvent}**/evt) {
		if (this.isMoving) {
			this.move(evt);
		}
	}
	pointerUp(/**@type{PointerEvent}**/evt) {
		if (this.isMoving) {
			this.endMove(evt);
		}
	}




	fireUpdate() {
		if (this.onUpdate) {
			this.onUpdate();
		}
	}

	remove() {
		this.dom.remove();
		if (this.onRemove) {
			this.onRemove(this);
			this.onRemove = null;
		}
	}


	getConfig() {
		throw 'Widget.getConfig() is not implemented!';
	}




	setData(data) {
		log(this.id, data);
		let item = data;
		for (const id of this.id) {
			item = item.Children.find(it=>it.Text == id);
			if (!item) break;
		}
		if (!item) {
			//TODO error
			log('error')
		} else {
			//TODO data
			log(item.Value);
		}
	}
}


// src\ohmd\Dashboard.js





class Dashboard {
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
			style.innerHTML = 'html,body {  margin: 0;  padding: 0;}body {  background-color: #1d1d1d;  display: flex;  flex-direction: row;}.ohmd--ohmContainer {  background-color: #969696;  box-sizing: border-box;  height: 100vh;  left: 0vw;  overflow: auto;  position: absolute;  top: 0;  transition: 200ms;  z-index: 2;}.ohmd--ohmContainer > .ohmd--ohmContainer-content {  box-sizing: border-box;  direction: rtl;  height: 100vh;  overflow: auto;  padding: 0 10px;}.ohmd--ohmContainer > .ohmd--ohmContainer-content > .header,.ohmd--ohmContainer > .ohmd--ohmContainer-content > .main {  direction: ltr;}.ohmd--ohmContainer > .ohmd--ohmContainer-toggle {  box-sizing: border-box;  background-color: transparent;  color: #ffffff;  cursor: pointer;  display: block;  height: 100vh;  line-height: 20px;  padding-top: calc(50vh - 30px);  position: absolute;  right: 0;  text-align: center;  top: 0;  width: 15px;}.ohmd--ohmContainer > .ohmd--ohmContainer-toggle:after {  content: \"◀ ◀ ◀\";}.ohmd--ohmContainer > .ohmd--ohmContainer-toggle:hover {  background-color: rgba(60 60 60 / 50%);}.ohmd--ohmContainer.ohmd--collapsed {  background-color: transparent;}.ohmd--ohmContainer.ohmd--collapsed > .ohmd--ohmContainer-toggle:after {  content: \"▶ ▶ ▶\";}.ohmd--container {  flex: 1 1 100vw;  height: 100vh;  position: relative;  transform-origin: right;  transition: transform 200ms;}.ohmd--container > .ohmd--widget {  background-color: rgba(255 255 255 / 0%);  min-height: 40px;  overflow: hidden;  position: absolute;  transition: background-color ease-in-out 200ms;  min-width: 60px;}.ohmd--container > .ohmd--widget:hover,.ohmd--container > .ohmd--widget.ohmd--hovered {  background-color: rgba(255 255 255 / 25%);}.ohmd--container > .ohmd--widget:hover > .ohmd--widget-header > .ohmd--widget-actions,.ohmd--container > .ohmd--widget.ohmd--hovered > .ohmd--widget-header > .ohmd--widget-actions {  opacity: 1;}.ohmd--container > .ohmd--widget:hover > .ohmd--widget-body > .ohmd--widget-resizer,.ohmd--container > .ohmd--widget.ohmd--hovered > .ohmd--widget-body > .ohmd--widget-resizer {  opacity: 1;}.ohmd--container > .ohmd--widget > .ohmd--widget-header {  color: #73735a;  cursor: move;  font-weight: bold;  height: 20px;  margin-bottom: 5px;  position: relative;}.ohmd--container > .ohmd--widget > .ohmd--widget-header > .ohmd--widget-title {  font-size: 16px;  height: 18px;  overflow: hidden;  padding: 2px 50px 0 10px;  text-overflow: ellipsis;  white-space: nowrap;}.ohmd--container > .ohmd--widget > .ohmd--widget-header > .ohmd--widget-actions {  opacity: 0;  position: absolute;  right: 0;  top: 0;  transition: opacity ease-in-out 200ms;}.ohmd--container > .ohmd--widget > .ohmd--widget-header > .ohmd--widget-actions > .ohmd--widget-action {  display: inline-block;  height: 20px;  margin-left: 2px;  width: 20px;}.ohmd--container > .ohmd--widget > .ohmd--widget-header > .ohmd--widget-actions > .ohmd--widget-action.ohmd--widget-remove {  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAAAZdEVYdFNvZnR3YXJlAFBhaW50Lk5FVCB2My41LjVJivzgAAAA30lEQVQ4T9WUQQqDMBBFhdxAg5tk5w1ciguP4qL3LyJdlna+ycg0xGS6az98osn8NyhDmr+WjWtOfVx1MsasXddt9DiHnQ/NOKOaW3wvC7BhGJ7jOL6cczttSejsvd9xhpoqVMLYAnrC2DVoS59ylwE2oCmMba1Fw8t/OlF4ywVzpiYPyiwhei0VVAtjFaHfwqAFoRwMRjOqmUJpXUUYWwtVwdg1aI8RyAWpyU7h7BlGjbJtQCTCkKaDDRgdHYOdQuNgr0f4ShIqYKwTqoKxAFVcDjqYUOmKKl1tP62meQNRWMNDZctVeQAAAABJRU5ErkJggg==\");}.ohmd--container > .ohmd--widget > .ohmd--widget-header > .ohmd--widget-actions > .ohmd--widget-action.ohmd--widget-config {  background-image: url(\"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABQAAAAUCAYAAACNiR0NAAABk0lEQVQ4jWNgGAWUAkZ0gYWLFkkcPHQo/9GjRxIiIiI3y8vKVhkaGNwj24aJkyZ5qWlo3GXl4PjPws7+X05B4XVAUJAeRc6+evWqRFRMzHxhMbGfLOzs/y2trV+TbMiuXbvUVq5aJYcspmdg4MfCxvaflYPj/+o1axyIMYcJxjh0+LBbQ2Pj+dKysiSYmL+/vwYDIyPD/3//GE6cPGlBkgt7+/oMxCQl/3Pz8f13dHHZ7OTqWiSnoPCShZ39Pws7+38+QcH/Hl5eKydMmsRHtKG+/v6L2Tg5/7Ows/9nYWNDpaFYVUPjY3RcXNitW7fYCBr4/v17gdDw8G4ZefmHkjIyvxVVVO5b2dgc5+Hn/4tsKBcv7393L6/9GzZu1CHKpQ8ePGA6efKkFoxfUloap2do+JGFje0/MpaVl38bl5CQRXQQIINly5dLRURFbRYUEUEJBjlFxd+XL1/WImwCFnDhwgWmrJwcNzVNzbswAw2NjU++e/eOibBuPODBgwciMXFxs908PC5u3bbNgSLDRgEGAADSHpQeJbnt6wAAAABJRU5ErkJggg==\");}.ohmd--container > .ohmd--widget > .ohmd--widget-body > .ohmd--widget-chartContainer {  bottom: 0;  left: 0;  position: absolute;  right: 0;  top: 25px;}.ohmd--container > .ohmd--widget > .ohmd--widget-body > .ohmd--widget-resizer {  background-color: rgba(140, 140, 140, 0.5);  bottom: 0;  cursor: se-resize;  height: 10px;  opacity: 0;  position: absolute;  right: 0;  width: 26px;  background-image: repeating-linear-gradient(0deg, #000000, #000000 1px, rgba(255, 255, 255, 0) 1px, rgba(255, 255, 255, 0) 3px);  transform: rotate(-45deg) translateX(4px) translateY(6px);}';
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


// src\lib\basics.js
const log = (...msgs)=>console.log.call(console.log, '[OHMD]', ...msgs);
const error = (...msgs)=>console.error.call(console.error, '[OHMD]', ...msgs);

const $ = (root,query)=>(query?root:document).querySelector(query?query:root);
const $$ = (root,query)=>Array.from((query?root:document).querySelectorAll(query?query:root));

const wait = async(millis)=>(new Promise(resolve=>setTimeout(resolve,millis)));


// src\ohmd\PixelService.js
class PixelService {
	/**@type{HTMLElement}*/ reference;
	/**@type{Number}*/ offset = 0;
	/**@type{Number}*/ factor = 1.0;




	constructor(/**@type{HTMLElement}*/reference) {
		this.reference = reference;
	}




	update() {
		const rect = this.reference.getBoundingClientRect();
		this.offset = rect.left;
		this.factor = rect.right / rect.width;
	}




	x(value) {
		return (value - this.offset) * this.factor;
	}
}


// src\ohmd\ChartWidget.js



class ChartWidget extends Widget {
	chart;

	/**@type{Number}*/ #width = 0;
	get width() { return this.#width; }
	set width(value) {
		if (this.#width != value) {
			this.#width = value;
			if (this.dom) this.dom.style.width = `${value}px`;
		}
	}
	/**@type{Number}*/ #height = 0;
	get height() { return this.#height; }
	set height(value) {
		if (this.#height != value) {
			this.#height = value;
			if (this.dom) this.dom.style.height = `${value}px`;
		}
	}

	/**@type{Number}*/ history = 120;
	/**@type{Number}*/ max = null;

	/**@type{String}*/ #lineColor;
	get lineColor() { return this.#lineColor; }
	set lineColor(value) {
		if (this.#lineColor != value) {
			this.#lineColor = value;
			if (this.chart) this.chart.data.datasets[0].borderColor = value;
		}
	}
	
	/**@type{String}*/ #fillColor;
	get fillColor() { return this.#fillColor; }
	set fillColor(value) {
		if (this.#fillColor != value) {
			this.#fillColor = value;
			if (this.chart) this.chart.data.datasets[0].backgroundColor = value;
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
		}
		) {
		super(pixel, {sensor, name});
		this.buildDom();
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		if (lineColor === null) {
			if (this.sensor.toLowerCase().search('nvidia') != -1) {
				this.lineColor = 'rgba(118,185,0,0.25)';
			} else if (this.sensor.toLowerCase().search('intel') != -1) {
				this.lineColor = 'rgba(0,113,197,0.25)';
			} else {
				this.lineColor = 'rgba(115,115,90,0.25)';
			}
		} else {
			this.lineColor = lineColor;
		}
		if (fillColor === null) {
			if (this.sensor.toLowerCase().search('nvidia') != -1) {
				this.fillColor = 'rgba(118,185,0,0.25)';
			} else if (this.sensor.toLowerCase().search('intel') != -1) {
				this.fillColor = 'rgba(0,113,197,0.25)';
			} else {
				this.fillColor = 'rgba(115,115,90,0.25)';
			}
		} else {
			this.fillColor = fillColor;
		}
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
								ticks: {
									suggestedMin: 0,
								},
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
			log('error')
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
// ---------------- /IMPORTS ----------------





	const app = new Dashboard();
	log(app);
})();