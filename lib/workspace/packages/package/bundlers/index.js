const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const BundleSettings = require('./settings');
const equal = require('@beyond-js/equal');

module.exports = class Bundlers extends DynamicProcessor {
	get dp() {
		return 'package.bundlers';
	}

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

	#package;
	#config;

	constructor(pkg, config) {
		super();

		this.setMaxListeners(1000);
		this.#package = pkg;
		this.#config = config;

		super.setup(new Map([['config', { child: config }]]));
	}

	_process() {
		const done = ({ updated, errors, warnings }) => {
			errors = errors ? errors : [];
			warnings = warnings ? warnings : [];
			updated = updated ? updated : [];

			const changed = equal(
				{ updated: [...updated.keys()], errors, warnings },
				{ updated: [...this.keys()], errors: this.#errors, warnings: this.#warnings }
			);

			this.#errors = errors;
			this.#warnings = warnings;

			this.clear();
			updated.forEach((value, key) => this.set(key, value));
			return changed;
		};

		const config = this.#config.value;
		if (typeof config !== 'object' || config instanceof Array) {
			return done({ errors: [`Invalid bundlers configuration, configuration must be an object`] });
		}

		const warnings = [];
		const updated = new Map();

		for (const [id, settings] of Object.entries(config)) {
			if (typeof settings !== 'object') {
				warnings.push(`Settings of bundler "${specifier}" is invalid`);
				continue;
			}

			if (this.has(id)) {
				updated.set(id, this.get(id));
				this.get(id).settings.value = settings;
				continue;
			}

			let resolved = null;
			const specifier = settings.specifier ? settings.specifier : id;
			try {
				resolved = require.resolve(specifier, { paths: [this.#package.path] });
			} catch (exc) {
				warnings.push(`Bundler "${specifier}" not found`);
				continue;
			}

			try {
				const meta = require(resolved);
				updated.set(id, { meta, settings: new BundleSettings(settings) });
			} catch (exc) {
				console.error(exc);
				warnings.push(`Error requiring bundler "${specifier}": ${exc.message}`);
			}
		}

		return done({ updated, warnings });
	}
};
