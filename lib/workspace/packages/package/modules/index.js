const ipc = require('@beyond-js/ipc/main');
const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const { relative } = require('path');
const ModulesCollection = require('./collection');

/**
 * Collection of package modules
 */
module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.modules';
	}

	#package;
	get package() {
		return this.#package;
	}

	#collection;

	get rpath() {
		if (!this.path) return;
		return relative(this.#package.path, this.path);
	}

	#specifiers = new Set();
	get specifiers() {
		return this.#specifiers;
	}

	// The modules in a map where the key is its relative path
	#rpaths = new Map();
	get rpaths() {
		return this.#rpaths;
	}

	#seekers;
	get seekers() {
		return this.#seekers;
	}

	#propagator;

	/**
	 * Application modules constructor
	 *
	 * @param package {object} The package object
	 * @param config {object} The modules configuration
	 */
	constructor(pkg, config) {
		super();
		this.setMaxListeners(500); // One listener per seekers is require

		this.#package = pkg;

		const collection = (this.#collection = new ModulesCollection(pkg, config));
		super.setup(new Map([['collection', { child: collection }]]));

		this.#seekers = new (require('./seekers'))(pkg);
		this.#propagator = new (require('./propagator'))(this._events);
	}

	_prepared(require) {
		// Be sure that the modules are ready before the collection is processed
		const collection = this.#collection;
		collection.forEach(module => require(module, module.id));
	}

	_notify() {
		ipc.notify('data-notification', {
			type: 'list/update',
			table: 'packages-modules',
			filter: { package: this.#package.id }
		});
	}

	_process() {
		const collection = this.#collection;
		const updated = new Map();
		collection.forEach(module => updated.set(module.id, module));

		console.log('collection size', collection.path);

		// Check if collection has changed
		const changed = (() => {
			if (this.size !== updated.size) return true;
			return [...updated.values()].reduce((prev, module) => prev || !this.has(module.id), false);
		})();
		if (!changed) return false;

		// Subscribe modules that are new to the collection
		this.#propagator.subscribe([...updated.values()].filter(module => !this.has(module.id)));

		// Unsubscribe unused modules
		this.#propagator.unsubscribe([...this.values()].filter(module => !updated.has(module.id)));

		// Set the processed collection
		super.clear(); // Do not use this.clear() as it would unsubscribe reused modules
		this.#specifiers.clear();
		this.#rpaths.clear();
		updated.forEach(module => {
			const { id, specifier, rpath } = module;

			// The module id and its rpath are independent of the platform
			this.set(id, module);
			this.#rpaths.set(rpath, module);
			this.#specifiers.add(specifier);
		});
	}

	clear() {
		this.#propagator.unsubscribe([...this.values()]);
		this.#specifiers.clear();
		this.#rpaths.clear();
		super.clear();
	}

	destroy() {
		super.destroy();
		this.clear();
	}
};
