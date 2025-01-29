const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const equal = require('@beyond-js/equal');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'bundler.specs';
	}

	#values;
	get values() {
		return this.#values;
	}
	set values(values) {
		const changed = !equal(values, this.#values);
		if (!changed) return;

		this.#values = values;
		this._invalidate();
	}
};
