import { ValueWidgetDialog } from "./ValueWidgetDialog.js";
import { Widget } from "./Widget.js";

export class ValueWidget extends Widget {
	/**@type{String}*/ #color;
	get color() { return this.#color; }
	set color(value) {
		if (this.#color != value) {
			this.#color = value;
			this.value.style.color = `rgba(${value.join(', ')})`;
		}
	}
	
	/**@type{Number}*/ #fontSize;
	get fontSize() { return this.#fontSize; }
	set fontSize(value) {
		if (this.#fontSize != value) {
			this.#fontSize = value;
			this.value.style.fontSize = `${value}px`;
		}
	}

	/**@type{String}*/ format;

	/**@type{HTMLDivElement}*/ value;




	constructor(
		/**@type{Preferences}*/prefs,
		/**@type{PixelService}*/pixel,
		{
			/**@type{String}*/sensor,
			/**@type{String}*/name,
			/**@type{Number}*/left=0,
			/**@type{Number}*/top=0,
			/**@type{String}*/color=null,
			/**@type{Number}*/fontSize=null,
			/**@type{String}*/format=null,
		}
	) {
		super(prefs, pixel, {sensor, name});
		this.buildDom();
		this.left = left;
		this.top = top;
		if (color === null) {
			if (this.sensor.toLowerCase().search('nvidia') != -1) {
				this.color = [118, 185, 0, 1];
			} else if (this.sensor.toLowerCase().search('intel') != -1) {
				this.color = [0, 113, 197, 1];
			} else {
				this.color = [115, 115, 90, 1];
			}
		} else {
			this.color = color;
		}
		this.fontSize = fontSize ?? 32;
		this.format = format ?? '0';
	}


	buildDom() {
		super.buildDom();

		const container = document.createElement('div'); {
			container.classList.add('ohmd--widget-valueContainer');
			const value = document.createElement('div'); {
				this.value = value,
				value.classList.add('ohmd--widget-value');
				container.append(value);
			}
			this.body.append(container);
		}
	}




	async showSettings(/**@type{HTMLElement}*/trigger) {
		const dlg = new ValueWidgetDialog(this.getConfig());
		await dlg.show(trigger);
		if (await dlg.outcome) {
			this.name = dlg.name,
			this.color = dlg.color;
			this.fontSize = dlg.fontSize;
			this.format = dlg.format;
			this.fireUpdate();
		}
	}


	getConfig() {
		return {
			type: 'value',
			sensor: this.sensor,
			name: this.name,
			left: this.left,
			top: this.top,
			color: this.color,
			format: this.format,
			fontSize: this.fontSize,
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
			const value = parseFloat(item.Value.replace(',', '.'));
			const parts = this.format.match(/(\d+)(?:([\.,:])(\d+))?(?:(\s*)\$(.+))?/);
			if (parts[2] == undefined) parts[2] = '';
			if (parts[3] == undefined) parts[3] = '';
			if (parts[4] == undefined) parts[4] = '';
			if (parts[5] == undefined) parts[5] = '';
			let out = '';
			let leading = '';
			const p1l = parseInt(value).toString().length;
			if (parts[1].length > 0 && p1l < parts[1].length) {
				leading = '0'.repeat(parts[1].length - p1l);
			}
			out += parseInt(value);
			if (parts[2].length > 0) {
				out += parts[2];
			}
			if (parts[3].length > 0) {
				out += value.toFixed(parts[3].length).slice(-parts[3].length);
			}
			if (parts[5].length > 0) {
				out += `${parts[4]}${parts[5]}`;
			}
			this.value.textContent = `${leading}${out}`;
		}
	}
}