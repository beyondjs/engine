const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const equal = require('@beyond-js/equal');

module.exports = class BunddleSettings extends DynamicProcessor {
	#value;
	get value() {
		return this.#value;
	}
	set value(value) {
		if (equal(value, this.#value)) return;

		this.#value = value;
		this._invalidate();
	}

	constructor(value) {
		super();
		this.#value = value;
	}
};
