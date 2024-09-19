const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);

module.exports = class extends DynamicProcessor {
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
		return 'bundles-registry';
	}

	get transversals() {
		return new Map([...this].filter(([name, bundle]) => bundle.transversal && [name, bundle]));
	}

	#config;
	#bundles = new Map([
		[
			'@beyond-js/bundle-code',
			{
				processors: [
					'@beyond-js/ts-processor',
					'@beyond-js/scss-processor',
					'@beyond-js/vue-processor',
					'@beyond-js/svelte-processor',
				],
			},
		],
	]);
	get bundles() {
		return this.#bundles;
	}

	constructor(config) {
		super();
		//TODO: Review the use of setMaxListeners
		this.setMaxListeners(1000);
		this.#config = config;
		// super.setup(new Map([['config', { child: config }]]));
	}

	_process() {
		for (const [specifier, settings] of this.#bundles) {
			try {
				const meta = require(specifier);

				if (typeof meta.name !== 'string' || !meta.name) {
					this.#warnings.push(`Bundle name is invalid on path "${path}"`);
					continue;
				}
				if (this.has(meta.name)) {
					this.#warnings.push(`Bundle "${meta.name}" is already registered`);
					continue;
				}
				this.set(meta.name, { meta, settings });
			} catch (exc) {
				this.#errors.push(`Error registering items of path "${path}": ${exc.message}`);
			}
		}
	}
};
