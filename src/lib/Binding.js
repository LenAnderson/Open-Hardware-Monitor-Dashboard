import { BindingTarget } from "./BindingTarget.js";

export class Binding {
	/**@type {Binding[]}*/ static bindings = [];
	/**@type {Object}*/ source;
	/**@type {String}*/ propertyName;
	/**@type {BindingTarget[]}*/ targets = [];
	/**@type {Function}*/ theGetter;
	/**@type {Function}*/ theSetter;
	/**@type {Boolean}*/ isProperty = false;
	value;
	static create(source, propertyName, target, attributeName, targetConverter=v=>v, sourceConverter=v=>v) {
		let binding = this.bindings.find(it=>it.source==source&&it.propertyName==propertyName);
		if (!binding) {
			binding = new Binding(source, propertyName);
			this.bindings.push(binding);
		}
		binding.targets.push(new BindingTarget(target, attributeName, targetConverter, sourceConverter));
		binding.setTargetValue();
		switch (target.tagName) {
			case 'TEXTAREA':
			case 'INPUT': {
				switch (attributeName) {
					case 'value':
					case 'checked': {
						switch (target.type) {
							case 'radio': {
								target.addEventListener('change', ()=>target.checked?binding.setter(target.value):false);
								break;
							}
							default: {
								target.addEventListener('change', ()=>binding.setter(sourceConverter(target[attributeName])));
								break;
							}
						}
						break;
					}
				}
				break;
			}
		}
	}
	constructor(source, propertyName) {
		this.source = source;
		this.propertyName = propertyName;
		
		this.value = this.source[this.propertyName];
		const p = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(source), propertyName);
		if (p) {
			this.isProperty = true;
			this.theGetter = p.get.bind(source);
			this.theSetter = p.set.bind(source);
		} else {
			this.theGetter = ()=>this.value;
			this.theSetter = (value)=>this.value=value;
		}
		Object.defineProperty(source, propertyName, {
			get: this.getter.bind(this),
			set: this.setter.bind(this)
		});
		this.setTargetValue();
	}
	getter() {
		return this.theGetter();
	}
	setter(value) {
		let changed = false;
		if (this.isProperty) {
			this.theSetter(value);
			changed = this.getValueOf(this.value) != this.getValueOf(this.theGetter())
		} else {
			changed = this.theGetter() != value;
		}
		if (changed) {
			this.value = this.isProperty ? this.theGetter() : value;
			this.setTargetValue();
		}
	}
	getValueOf(it) {
		if (it !== null && it !== undefined && it.valueOf) {
			return it.valueOf();
		}
		return it;
	}
	setTargetValue() {
		this.targets.forEach(target=>{
			if (target.attributeName.substring(0,5) == 'data-') {
				target.target.setAttribute(target.attributeName, target.targetConverter(this.theGetter()));
			} else {
				target.target[target.attributeName] = target.targetConverter(this.theGetter());
			}
		});
	}
}