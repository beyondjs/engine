const BundlerSpecs = require('./bundler-specs');
const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const { Config } = require('@beyond-js/config');
const equal = require('@beyond-js/equal');
const sep = require('path').sep;

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.entry';
	}

	#package;
	get package() {
		return this.#package;
	}

	#file;
	get file() {
		return this.#file;
	}

	/**
	 * The normalized relative path of the module
	 */
	get rpath() {
		let rpath = this.#file.relative.dirname;
		rpath = sep === '/' ? rpath : rpath.replace(/\\/g, '/');
		return rpath.replace(/\/$/, ''); // Remove trailing slash;
	}

	#config;
	get config() {
		return this.#config;
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

	constructor(finder, file) {
		super();

		const config = new Config(file.dirname, { '/static': 'object' });
		config.data = 'module.json';
		super.setup(new Map([['config', { child: config }]]));

		this.#config = config;
		this.#package = finder.package;
		this.#file = file;
	}

	_process() {
		console.log('process entry');
		const done = ({ updated, errors, warnings }) => {
			const changed = !equal(
				{ bundlers: [...updated.keys()], errors, warnings },
				{ bundlers: [...this.keys()], errors: this.#errors, warnings: this.#warnings }
			);

			this.#warnings = warnings ? warnings : [];
			this.#errors = errors ? errors : [];

			// Destroy unused bundlers specs
			this.forEach((specs, name) => !updated?.has(name) && specs.destroy());

			this.clear();
			updated?.forEach((specs, name) => this.set(name, specs));

			return changed;
		};

		if (!this.#config.valid) {
			return done({ data: {}, errors: this.#config.errors, warnings: this.#config.warnings });
		}
		if (!this.#config.value) {
			return done({ data: {}, warnings: this.#config.warnings });
		}

		// Process the bundlers configuration
		const config = this.#config.value;

		// Just for backward compatibility ('name' as subpath synonimous)
		config.subpath = config.subpath ? config.subpath : config.name;
		const subpath = config.subpath ? config.subpath : this.rpath;
		delete config.name;
		delete config.subpath;

		const common = { description: config.description };
		delete config.description;
		delete config.title; // This property is not longer be used, avoid to detect it as a bundler

		const bundlers = new Map();

		// At this point, all the common properties are removed from the config object
		if (config.bundler) {
			/**
			 * When the bundler is specified, then only one bundler is specified in the entry,
			 * so convert the entry to {bundler: ...}
			 */
			const specs = { bundler: config.bundler, subpath };
			bundlers.set(config.bundler, specs);

			for (const property of Object.keys(config)) {
				if (property === 'bundler') continue;
				if (property === 'subpath') continue; // It is invalid to define a subpath in the bundler specs

				// Move the property to the bundler specs
				specs[property] = config[property];
			}
		} else {
			const entries = Object.entries(config);

			// At this point, all the properties of the config object should be the bundlers configuration
			for (const [name, config] of entries) {
				const specs = Object.assign({ bundler: name }, config, common);
				specs.subpath = entries.length > 1 ? `${subpath}.${bundlerName}` : subpath;
				bundlers.set(name, specs);
			}
		}

		// To uniquely identify the bundler,
		// we do so through the relative location of the entry on disk and the name of the bundler.
		bundlers.forEach((specs, name) => Object.assign(specs, { id: `${this.rpath}:${name}` }, common));

		const updated = new Map();
		bundlers.forEach((values, name) => {
			const specs = this.has(name) ? this.get(name) : new BundlerSpecs();
			updated.set(name, specs);
			specs.values = values;
		});

		return done({ updated, warnings: this.#warnings });
	}
};
