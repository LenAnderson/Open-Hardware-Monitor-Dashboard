import { ValueWidget } from "./ValueWidget.js";

export class TimeWidget extends ValueWidget {
	constructor(
		/**@type{Preferences}*/prefs,
		/**@type{PixelService}*/pixel,
		{
			/**@type{Number}*/left=0,
			/**@type{Number}*/top=0,
			/**@type{String}*/color=null,
			/**@type{Number}*/fontSize=null,
		}
	) {
		super(prefs, pixel, {sensor:'', left, top, color, fontSize});
	}




	getConfig() {
		return {
			type: 'time',
			left: this.left,
			top: this.top,
			color: this.color,
			fontSize: this.fontSize,
		}
	}




	setData(data) {
		this.value.textContent = new Date().toISOString().split('T')[1].split(':').slice(0,2).join(':');
	}
}