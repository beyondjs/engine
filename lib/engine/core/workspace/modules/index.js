const ipc = require('@beyond-js/ipc/main');
const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);

/**
 * Collection of package modules
 */
module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.modules';
	}

	#package;

	// Used to check if a specifier is available regardless of the platform that requires it
	#specifiers = new Set();
	get specifiers() {
		return this.#specifiers;
	}

	// The modules in a map where the key is `${specifier}//${platform}`
	#platforms = new Map();
	get platforms() {
		return this.#platforms;
	}

	// The modules in a map where the key is its relative path
	#rpaths = new Map();
	get rpaths() {
		return this.#rpaths;
	}

	/**
	 * The collection of bundles of the package
	 */
	#bundles;
	get bundles() {
		return this.#bundles;
	}

	#seekers;
	get seekers() {
		return this.#seekers;
	}

	#propagator;

	get self() {
		return this.children.get('self').child;
	}

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

		const children = new Map();

		const self = new (require('./self'))(application, config);
		children.set('self', { child: self });

		this.#bundles = new (require('./bundles'))(this);
		this.#seekers = new (require('./seekers'))(application);
		this.#propagator = new (require('./propagator'))(this._events);
	}

	_prepared(require) {
		const self = this.children.get('self').child;
		self.forEach(module => require(module, module.id));
	}

	_notify() {
		ipc.notify('data-notification', {
			type: 'list/update',
			table: 'packages-modules',
			filter: { package: this.#package.id }
		});
	}

	_process() {
		const self = this.children.get('self').child;

		const updated = new Map();
		const add = module => updated.set(module.id, module);
		self.forEach(module => add(module));

		// Check if collection has changed
		const changed = (() => {
			if (this.size !== updated.size) return true;

			for (const { id, specifier, rpath, platforms } of updated.values()) {
				for (const platform of platforms) {
					if (!this.has(`${id}//${platform}`)) return true;
					if (!this.#platforms.has(`${specifier}//${platform}`)) return true;
					if (!this.#rpaths.has(`${rpath}//${platform}`)) return true;
				}
			}
			return false;
		})();
		if (!changed) return false;

		// Subscribe modules that are new to the collection
		this.#propagator.subscribe([...updated.values()].filter(module => !this.has(module.id)));

		// Unsubscribe unused modules
		this.#propagator.unsubscribe([...this.values()].filter(module => !updated.has(module.id)));

		// Set the processed collection
		super.clear(); // Do not use this.clear() as it would unsubscribe reused modules
		this.#specifiers.clear();
		this.#platforms.clear();
		this.#rpaths.clear();
		updated.forEach(module => {
			const { id, specifier, rpath } = module;

			// The module id and its rpath are independent of the platform
			this.set(id, module);
			this.#rpaths.set(rpath, module);
			this.#specifiers.add(specifier);
			module.platforms.forEach(platform => this.#platforms.set(`${specifier}//${platform}`, module));
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
