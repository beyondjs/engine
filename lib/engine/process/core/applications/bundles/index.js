const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);

module.exports = class Bundles extends DynamicProcessor {
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

	#default = new Map([
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
		['@beyond-js/bundle-bridge', { processors: ['@beyond-js/ts-processor'] }],
		[
			'@beyond-js/bundle-start',
			{
				processors: [
					'@beyond-js/ts-processor',
					'@beyond-js/sass-processor',
					'@beyond-js/svelte-processor',
					'@beyond-js/less-processor',
					'@beyond-js/vue-processor',
					'@beyond-js/mdx-processor',
					'@beyond-js/scss-processor',
				],
			},
		],
		[
			'@beyond-js/bundle-widgets',
			{ processors: ['@beyond-js/ts-processor', '@beyond-js/less-processor', '@beyond-js/sass-processor'] },
		],
		['@beyond-js/sass-processor', { processors: ['@beyond-js/sass-processor'] }],
		[
			'@beyond-js/txt-bundle',
			{ processors: ['@beyond-js/ts-processor', '@beyond-js/less-processor', '@beyond-js/sass-processor'] },
		],
		['@beyond-js/ts-processor', { processors: ['@beyond-js/ts-processor'] }],
	]);

	constructor(config) {
		super();

		this.setMaxListeners(1000);
		this.#config = config;
		super.setup(new Map([['config', { child: config }]]));
	}

	_process() {
		const config = !this.#config.valid || !this.#config.value ? this.#default : this.#config.value;
		for (const [specifier, settings] of config) {
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
				this.set(meta.name, { meta, settings: new BundleSettings(settings) });
			} catch (exc) {
				this.#errors.push(`Error registering items of path "${specifier}": ${exc.message}`);
			}
		}
	}
};
