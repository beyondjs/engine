/**
 * The registry is created in lib/engine/process/core/index.js,
 * and exposed globally in lib/engine/process/core/global/index.js
 */
module.exports = new (class {
	#created = false;
	#registry;

	get bundles() {
		return this.#registry?.bundles;
	}

	get processors() {
		return this.#registry?.processors;
	}

	create(config) {
		if (this.#created) throw new Error('Bundler registries already created');
		this.#created = true;

		this.#registry = new (require('./registry'))(config);
	}
})();
