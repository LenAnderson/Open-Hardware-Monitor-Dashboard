import { Binding } from "../lib/Binding.js";
import { Dialog } from "../lib/Dialog.js";
import { Preferences } from "./Preferences.js";

export class SettingsDialog extends Dialog {
	/**@type{Boolean}*/ snapToGrid = true;
	/**@type{Boolean}*/ showGrid = false;
	/**@type{Number}*/ gridSize = 10;




	constructor(/**@type{Preferences}*/prefs) {
		super('Settings', 'OK', 'Cancel');
		this.snapToGrid = prefs.snapToGrid;
		this.showGrid = prefs.showGrid;
		this.gridSize = prefs.gridSize;
		this.buildBody();
	}


	buildBody() {
		const snapRow = document.createElement('div'); {
			snapRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				const inp = document.createElement('input'); {
					inp.type = 'checkbox';
					inp.placeholder = 'Snap to Grid';
					Binding.create(this, 'snapToGrid', inp, 'checked');
					lbl.append(inp);
				}
				lbl.append(document.createTextNode('Snap to Grid'));
				snapRow.append(lbl);
			}
			this.body.append(snapRow);
		}

		const showRow = document.createElement('div'); {
			showRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				const inp = document.createElement('input'); {
					inp.type = 'checkbox';
					inp.placeholder = 'Show Grid';
					Binding.create(this, 'showGrid', inp, 'checked');
					lbl.append(inp);
				}
				lbl.append(document.createTextNode('Show Grid'));
				showRow.append(lbl);
			}
			this.body.append(showRow);
		}

		const sizeRow = document.createElement('div'); {
			sizeRow.classList.add('ohmd--dialog--body--row');
			const lbl = document.createElement('label'); {
				lbl.append(document.createTextNode('Grid Size'));
				const inp = document.createElement('input'); {
					inp.type = 'number';
					inp.max = 999;
					inp.min = 5;
					inp.placeholder = 'Grid Size';
					Binding.create(this, 'gridSize', inp, 'value', v=>v, v=>parseInt(v));
					lbl.append(inp);
				}
				sizeRow.append(lbl);
			}
			this.body.append(sizeRow);
		}
	}
}