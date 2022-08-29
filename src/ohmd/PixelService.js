export class PixelService {
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