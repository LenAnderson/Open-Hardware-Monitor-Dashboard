import { Binding } from "../lib/Binding.js";
import { Dialog } from "../lib/Dialog.js";
import { ChartWidgetPreferences } from "./ChartWidgetPreferences.js";

export class ChartWidgetDialog extends Dialog {
	/**@type{ChartWidgetPreferences}*/ prefs;




	constructor(/**@type{ChartWidgetPreferences}*/prefs) {
		super('Widget Settings', 'OK', 'Cancel');
		this.prefs = new ChartWidgetPreferences(prefs);

		this.buildBody();
	}


	buildBody() {
		const nameRow = document.createElement('div'); {
			nameRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Name'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input--long');
					inp.type = 'text';
					inp.placeholder = 'Name';
					Binding.create(this.prefs, 'name', inp, 'value');
					lbl.append(inp);
				}
				nameRow.append(lbl);
			}
			this.body.append(nameRow);
		}
		
		const lineColorRow = document.createElement('div'); {
			lineColorRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Line Color'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input');
					inp.type = 'text';
					inp.placeholder = 'Line Color';
					Binding.create(this.prefs, 'lineColor', inp, 'value',
						v=>v.slice(0,3).join(' '),
						v=>[...v.split(' '), parseInt(opacity.value)/100],
					);
					lbl.append(inp);
				}

				lbl.append(document.createTextNode('@'));

				const opacity = document.createElement('input'); {
					opacity.type = 'number';
					opacity.placeholder = 'Opacity';
					opacity.max = 100;
					opacity.min = 0;
					Binding.create(this.prefs, 'lineColor', opacity, 'value',
						v=>v.slice(-1)*100,
						v=>[...inp.value.split(' '), parseInt(v)/100]
					);
					lbl.append(opacity);
				}

				const picker = document.createElement('input'); {
					picker.type = 'color';
					picker.placeholder = 'Line Color';
					Binding.create(this.prefs, 'lineColor', picker, 'value',
						v=>`#${v.slice(0,3).map(it=>`00${parseInt(it).toString(16)}`.slice(-2)).join('')}`,
						v=>[parseInt(v.substring(1,3), 16), parseInt(v.substring(4,5), 16), parseInt(v.substring(6,7), 16), parseInt(opacity.value)/100]
					);
					lbl.append(picker);
				}
				lineColorRow.append(lbl);
			}
			this.body.append(lineColorRow);
		}
		
		const fillColorRow = document.createElement('div'); {
			fillColorRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Fill Color'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input');
					inp.type = 'text';
					inp.placeholder = 'Fill Color';
					Binding.create(this.prefs, 'fillColor', inp, 'value',
						v=>v.slice(0,3).join(' '),
						v=>[...v.split(' '), parseInt(opacity.value)/100],
					);
					lbl.append(inp);
				}

				lbl.append(document.createTextNode('@'));

				const opacity = document.createElement('input'); {
					opacity.type = 'number';
					opacity.placeholder = 'Opacity';
					opacity.max = 100;
					opacity.min = 0;
					Binding.create(this.prefs, 'fillColor', opacity, 'value',
						v=>v.slice(-1)*100,
						v=>[...inp.value.split(' '), parseInt(v)/100]
					);
					lbl.append(opacity);
				}

				const picker = document.createElement('input'); {
					picker.type = 'color';
					picker.placeholder = 'Fill Color';
					Binding.create(this.prefs, 'fillColor', picker, 'value',
						v=>`#${v.slice(0,3).map(it=>`00${parseInt(it).toString(16)}`.slice(-2)).join('')}`,
						v=>[parseInt(v.substring(1,3), 16), parseInt(v.substring(4,5), 16), parseInt(v.substring(6,7), 16), parseInt(opacity.value)/100]
					);
					lbl.append(picker);
				}
				fillColorRow.append(lbl);
			}
			this.body.append(fillColorRow);
		}

		const historyRow = document.createElement('div'); {
			historyRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('History [s]'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input--long');
					inp.type = 'number';
					inp.placeholder = 'History';
					Binding.create(this.prefs, 'history', inp, 'value', v=>v, v=>parseInt(v));
					lbl.append(inp);
				}
				historyRow.append(lbl);
			}
			this.body.append(historyRow);
		}

		const maxRow = document.createElement('div'); {
			maxRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Max. Value (0=auto)'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input--long');
					inp.type = 'number';
					inp.placeholder = 'Max Value';
					Binding.create(this.prefs, 'max', inp, 'value', v=>v, v=>parseInt(v));
					lbl.append(inp);
				}
				maxRow.append(lbl);
			}
			this.body.append(maxRow);
		}
	}
}