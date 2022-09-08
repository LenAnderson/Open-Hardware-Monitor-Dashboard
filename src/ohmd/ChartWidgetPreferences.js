export class ChartWidgetPreferences {
	/**@type{String}*/ name;
	/**@type{Number[]}*/ lineColor;
	/**@type{Number[]}*/ fillColor;
	/**@type{Number}*/ history;
	/**@type{Number}*/ max;




	constructor({name, lineColor, fillColor, history, max}) {
		this.apply({name, lineColor, fillColor, history, max});
	}

	apply({name, lineColor, fillColor, history, max}) {
		this.name = name;
		this.lineColor = lineColor;
		this.fillColor = fillColor;
		this.history = history;
		this.max = max;
	}
}