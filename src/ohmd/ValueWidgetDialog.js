import { Dialog } from "../lib/Dialog.js";

export class ValueWidgetDialog extends Dialog {
	/**@type{String}*/ name;
	/**@type{String}*/ color;
	/**@type{String}*/ format;
	/**@type{Number}*/ fontSize;




	constructor({/**@type{String}*/name, /**@type{String}*/color, /**@type{String}*/format, /**@type{Number}*/fontSize}) {
		super('Widget Settings', 'OK', 'Cancel');
		this.name = name;
		this.color = color;
		this.format = format;
		this.fontSize = fontSize;

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
					Binding.create(this, 'name', inp, 'value');
					lbl.append(inp);
				}
				nameRow.append(lbl);
			}
			this.body.append(nameRow);
		}
		
		const lineColorRow = document.createElement('div'); {
			lineColorRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Color'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input');
					inp.type = 'text';
					inp.placeholder = 'Color';
					Binding.create(this, 'color', inp, 'value',
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
					Binding.create(this, 'color', opacity, 'value',
						v=>v.slice(-1)*100,
						v=>[...inp.value.split(' '), parseInt(v)/100]
					);
					lbl.append(opacity);
				}

				const picker = document.createElement('input'); {
					picker.type = 'color';
					picker.placeholder = 'Color';
					Binding.create(this, 'color', picker, 'value',
						v=>`#${v.slice(0,3).map(it=>`00${parseInt(it).toString(16)}`.slice(-2)).join('')}`,
						v=>[parseInt(v.substring(1,3), 16), parseInt(v.substring(3,5), 16), parseInt(v.substring(5,7), 16), parseInt(opacity.value)/100]
					);
					lbl.append(picker);
				}
				lineColorRow.append(lbl);
			}
			this.body.append(lineColorRow);
		}
		
		const sizeRow = document.createElement('div'); {
			sizeRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Font Size'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input--long');
					inp.type = 'number';
					inp.placeholder = 'Font Size';
					inp.min = 1;
					inp.max = 999;
					Binding.create(this, 'fontSize', inp, 'value', v=>v, v=>parseInt(v));
					lbl.append(inp);
				}
				sizeRow.append(lbl);
			}
			this.body.append(sizeRow);
		}
		
		const formatRow = document.createElement('div'); {
			formatRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Format'));
				const inp = document.createElement('input'); {
					inp.classList.add('ohmd--input--long');
					inp.type = 'text';
					inp.placeholder = 'Format';
					Binding.create(this, 'format', inp, 'value');
					lbl.append(inp);
				}
				formatRow.append(lbl);
			}
			this.body.append(formatRow);
		}
	}
}