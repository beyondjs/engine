const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const equal = require('@beyond-js/equal');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'module.specs';
	}

	#values = {};
	get values() {
		return this.#values;
	}
	set values(values) {
		values = values || {};

		const changed = !equal(values, this.#values);
		if (!changed) return;

		this.#values = values;
		this._invalidate();
	}

	get id() {
		return this.#values.id;
	}

	get subpath() {
		return this.#values.subpath;
	}

	get description() {
		return this.#values.description;
	}
};
