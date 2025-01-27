const ipc = require('@beyond-js/ipc/main');
const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const { relative } = require('path');
const ModulesEntries = require('./entries');
const Module = require('./module');

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

	/**
	 * The collection of module.json entries. As they can specify more than one bundler, it means that
	 * one entry can have more than one module
	 */
	#entries;
	get entries() {
		return this.#entries;
	}

	get rpath() {
		if (!this.path) return;
		return relative(this.#package.path, this.path);
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

		const entries = (this.#entries = new ModulesEntries(pkg, config));
		super.setup(new Map([['entries', { child: entries }]]));

		this.#seekers = new (require('./seekers'))(pkg);
		this.#propagator = new (require('./propagator'))(this._events);
	}

	_prepared(require) {
		// Be sure that the modules are ready before the entries are processed
		const entries = this.#entries;
		entries.forEach(module => require(module, module.id));
	}

	_notify() {
		ipc.notify('data-notification', {
			type: 'list/update',
			table: 'packages-modules',
			filter: { package: this.#package.id }
		});
	}

	_process() {
		const entries = this.#entries;
		const updated = new Map();
		entries.forEach(entry =>
			entry.bundlers.forEach(config => {
				const module = this.has(config.id)
					? this.get(config.id)
					: new Module(this.#package, config.file, config.id, config.bundler);
				updated.set(config.id, module);

				module.configure(config);
			})
		);

		// Check if modules has changed
		const changed = (() => {
			if (this.size !== updated.size) return true;
			return [...updated.keys()].reduce((prev, module) => prev || !this.has(module.id), false);
		})();
		if (!changed) return false;

		// Subscribe modules that are new to the entries
		this.#propagator.subscribe([...updated.values()].filter(module => !this.has(module.id)));

		// Unsubscribe unused modules
		this.#propagator.unsubscribe([...this.values()].filter(module => !updated.has(module.id)));

		// Set the processed entries
		super.clear(); // Do not use this.clear() as it would unsubscribe reused modules
		this.#rpaths.clear();
		updated.forEach(module => {
			const { id, rpath, subpath } = module;

			// The module id and its rpath are independent of the platform
			this.set(id, module);
			this.#rpaths.set(rpath, module);
		});
	}

	clear() {
		this.#propagator.unsubscribe([...this.values()]);
		this.#rpaths.clear();
		super.clear();
	}

	destroy() {
		super.destroy();
		this.clear();
	}
};
