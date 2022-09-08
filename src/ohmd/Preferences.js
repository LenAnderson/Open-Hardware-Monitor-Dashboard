export class Preferences {
	/**@type{Boolean}*/ #snapToGrid = true;
	get snapToGrid() { return this.#snapToGrid ?? true; }
	set snapToGrid(/**@type{Boolean}*/value) {
		if (this.#snapToGrid != value) {
			this.#snapToGrid = value;
			this.save();
		}
	}

	/**@type{Boolean}*/ #showGrid = true;
	get showGrid() { return this.#showGrid ?? true; }
	set showGrid(/**@type{Boolean}*/value) {
		if (this.#showGrid != value) {
			this.#showGrid = value;
			this.save();
		}
	}

	/**@type{Number}*/ #gridSize = 1;
	get gridSize() { return this.#gridSize ?? 1; }
	set gridSize(/**@type{Number}*/value) {
		if (this.#gridSize != value) {
			this.#gridSize = value;
			this.save();
		}
	}




	save() {
		localStorage.setItem('ohmd-preferences', JSON.stringify({
			snapToGrid: this.snapToGrid,
			showGrid: this.showGrid,
			gridSize: this.gridSize,
		}));
	}
	load() {
		const prefs = JSON.parse(localStorage.getItem('ohmd-preferences') || '{}');
		this.snapToGrid = prefs.snapToGrid ?? true;
		this.showGrid = prefs.showGrid ?? false;
		this.gridSize = prefs.gridSize ?? 1;
	}
}