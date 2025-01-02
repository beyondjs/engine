const DynamicProcessor = require('@beyond-js/dynamic-processor')();

module.exports = class BunddleSettings extends DynamicProcessor {
	#value;
	get value() {
		return this.#value;
	}
	set value(value) {
		this.#value = value;
	}

	constructor(value) {
		this.#value = value;
	}
};
