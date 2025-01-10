const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const equal = require('@beyond-js/equal');

/**
 * The bundlers of the module or project
 */
module.exports = class extends DynamicProcessor {
	get dp() {
		return 'bundlers.config';
	}

	#container;

	#config;
	get config() {
		return this.#config;
	}

	#configured = false;
	get configured() {
		return this.#configured;
	}

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	get application() {
		return this.#container.is === 'application' ? container : container.application;
	}
	/**
	 * Bundles configuration constructor
	 *
	 * @param container {object} Can be a module or application (or library [legacy])
	 */
	constructor(container) {
		if (!container) throw new Error('Invalid parameters');
		super();

		this.#container = container;
		const application = container.is === 'application' ? container : container.application;

		super.setup(new Map([['registry.bundlers', { child: application.bundlers }]]));
	}

	_prepared() {
		return this.#configured;
	}

	_process() {
		let changed = false;
		const warnings = [];
		const updated = new Map();
		[...Object.entries(this.#config)].forEach(([name, config]) => {
			if (!this.application.bundlers.has(name)) {
				warnings.push(`Bundle "${name}" not found`);
				return;
			}

			const bundle = this.has(name)
				? this.get(name)
				: (changed = true) && new (require('./bundle'))(name, this.#container);

			updated.set(name, bundle);
			bundle.configure(config);
		});

		// Destroy unused bundlers
		this.forEach((bundle, name) => !updated.has(name) && (changed = true) && bundle.destroy());

		super.clear(); // Do not use this.clear as it would destroy bundlers that are being used
		updated.forEach((value, key) => this.set(key, value));

		changed = changed || !equal(this.#warnings, warnings);
		this.#warnings = warnings;
		return changed;
	}

	configure(config) {
		if (this.#configured && equal(config, this.#config)) return;

		this.#config = config;
		this.#configured = true;
		this._invalidate();
	}

	clear() {
		this.forEach(bundle => bundle.destroy());
	}

	destroy() {
		super.destroy();
		this.clear();
	}
};
