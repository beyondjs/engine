const SDK = require('@beyond-js/bundles-sdk');
module.exports = class {
	#application;
	#transversals = new Map();
	#config;

	constructor(application, config) {
		this.#application = application;
		this.#config = config;
	}

	get(name) {
		if (this.#transversals.has(name)) return this.#transversals.get(name);

		if (!SDK.bundles.has(name)) throw new Error(`Bundle "${name}" not found`);
		if (!SDK.bundles.get(name).transversal) throw new Error(`Bundle "${name}" is not a transversal bundle`);
		const { transversal } = SDK.bundles.get(name);

		const bundle = new transversal.Transversal(this.#application, name, this.#config);
		this.#transversals.set(name, bundle);
		return bundle;
	}

	has(name) {
		if (!SDK.bundles.has(name)) return false;
		return !!SDK.bundles.get(name).transversal;
	}
};
