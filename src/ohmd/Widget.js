import { error, log } from "../lib/basics.js";
import { Binding } from "../lib/Binding.js";
import { PixelService } from "./PixelService.js";
import { Preferences } from "./Preferences.js";

export class Widget {
	/**@type{String}*/ sensor;
	/**@type{String[]}*/ id;
	/**@type{String}*/ name;
	/**@type{Preferences}*/ prefs;
	/**@type{PixelService}*/ pixel;

	/**@type{HTMLDivElement}*/ dom;
	/**@type{HTMLDivElement}*/ body;

	/**@type{Number}*/ #left = 0;
	get left() { return this.#left; }
	set left(value) {
		if (this.#left != value) {
			if (this.prefs.snapToGrid) {
				value = Math.round(value/this.prefs.gridSize) * this.prefs.gridSize;
			}
			this.#left = value;
			if (this.dom) this.dom.style.left = `${value}px`;
		}
	}
	/**@type{Number}*/ #top = 0;
	get top() { return this.#top; }
	set top(value) {
		if (this.#top != value) {
			if (this.prefs.snapToGrid) {
				value = Math.round(value/this.prefs.gridSize) * this.prefs.gridSize;
			}
			this.#top = value;
			if (this.dom) this.dom.style.top = `${value}px`;
		}
	}

	/**@type{Boolean}*/ isMoving = false;
	pointerOffset = {left:0, top:0};

	/**@type{Function}*/ onUpdate;
	/**@type{Function}*/ onRemove;




	constructor(/**@type{Preferences}*/prefs, /**@type{PixelService}*/pixel, {/**@type{String}*/sensor, /**@type{String}*/name, /**@type{Number}*/left=0, /**@type{Number}*/top=0}) {
		this.sensor = sensor;
		this.id = sensor.split('---');
		this.name = name;
		this.prefs = prefs;
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
						config.addEventListener('click', ()=>this.showSettings(config));
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


	async showSettings(/**@type{HTMLElement}*/trigger) {
		throw 'Widget.showSettings() is not implemented!';
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
			error('error')
		} else {
			//TODO data
			log(item.Value);
		}
	}
}