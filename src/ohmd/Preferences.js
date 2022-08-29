export class Preferences {
	/**@type{Boolean}*/ #autoRefresh = true;
	get autoRefresh() { return this.#autoRefresh ?? true; }
	set autoRefresh(/**@type{Boolean}*/value) {
		if (this.#autoRefresh != value) {
			this.#autoRefresh = value;
			this.save();
		}
	}

	/**@type{Number}*/ #refreshInterval = 1;
	get refreshInterval() { return this.#refreshInterval ?? 1; }
	set refreshInterval(/**@type{Number}*/value) {
		if (this.#refreshInterval != value) {
			this.#refreshInterval = value;
			this.save();
		}
	}




	save() {
		localStorage.setItem('ohmd-preferences', JSON.stringify({
			autoRefresh: this.autoRefresh,
			refreshInterval: this.refreshInterval,
		}));
	}
	load() {
		const prefs = JSON.parse(localStorage.getItem('ohmd-preferences') || {});
		this.autoRefresh = prefs.autoRefresh ?? true;
		this.refreshInterval = prefs.refreshInterval ?? 1;
	}
}