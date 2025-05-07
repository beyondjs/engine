const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const equal = require('@beyond-js/equal');

module.exports = class BunddleSettings extends DynamicProcessor {
	#values;
	get values() {
		return this.#values;
	}
	set values(values) {
		if (equal(values, this.#values)) return;

		this.#values = values;
		this._invalidate();
	}

	constructor(values) {
		super();
		this.#values = values;
	}
};
