const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);

module.exports = class Bundlers extends DynamicProcessor {
	#errors = [];
	get errors() {
		return this.#errors;
	}

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	get valid() {
		return !this.#errors.length;
	}

	get dp() {
		return 'bundlers-registry';
	}

	get transversals() {
		return new Map([...this].filter(([name, bundle]) => bundle.transversal && [name, bundle]));
	}

	#application;
	#config;

	constructor(application, config) {
		super();

		this.setMaxListeners(1000);
		this.#application = application;
		this.#config = config;

		super.setup(new Map([['config', { child: config }]]));
	}

	_process() {
		this.#errors = [];
		this.#warnings = [];

		const config = this.#config.value;
		if (typeof config !== 'object' || config instanceof Array) {
			this.#errors.push(`Invalid bundlers configuration, configuration must be an object`);
			return;
		}

		for (const [specifier, settings] of Object.entries(config)) {
			const resolved = require.resolve(specifier, { path: this.#application.path });
			if (!resolved) {
				this.#errors.push(`Bundler "${specifier}" not found`);
				return;
			}

			try {
				const meta = require(resolved);

				if (typeof meta.name !== 'string' || !meta.name) {
					this.#warnings.push(`Bundle name is invalid on path "${path}"`);
					continue;
				}
				if (this.has(meta.name)) {
					this.#warnings.push(`Bundle "${meta.name}" is already registered`);
					continue;
				}
				this.set(meta.name, { meta, settings: new BundleSettings(settings) });
			} catch (exc) {
				this.#errors.push(`Error requiring bundler "${specifier}": ${exc.message}`);
			}
		}
	}
};
