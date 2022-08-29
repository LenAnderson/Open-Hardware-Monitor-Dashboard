export class BindingTarget {
	/**@type {HTMLElement}*/ target;
	/**@type {String}*/ attributeName;
	/**@type {Function}*/ targetConverter;
	/**@type {Function}*/ sourceConverter;
	constructor(
		/**@type {HTMLElement}*/ target,
		/**@type {String}*/ attributeName,
		/**@type {Function}*/ targetConverter,
		/**@type {Function}*/ sourceConverter
	) {
		this.target = target;
		this.attributeName = attributeName;
		this.targetConverter = targetConverter;
		this.sourceConverter = sourceConverter;
	}
}