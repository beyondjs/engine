const BundlerSpecs = require('./bundler-specs');
const DynamicProcessor = require('@beyond-js/dynamic-processor')(Map);
const { Config } = require('@beyond-js/config');
const equal = require('@beyond-js/equal');
const sep = require('path').sep;
const crc32 = require('@beyond-js/crc32');

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

	get path() {
		this.#file.dirname;
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
		const done = ({ updated, errors, warnings }) => {
			const changed = !equal(
				{ bundlers: [...updated.keys()], errors, warnings },
				{ bundlers: [...this.keys()], errors: this.#errors, warnings: this.#warnings }
			);

			this.#errors = errors ? errors : [];
			this.#warnings = warnings ? warnings : [];

			// Destroy unused bundlers specs
			this.forEach((specs, name) => !updated?.has(name) && specs.destroy());

			this.clear();
			updated?.forEach((specs, name) => this.set(name, specs));

			return changed;
		};

		if (!this.#config.valid) {
			return done({ errors: this.#config.errors, warnings: this.#config.warnings });
		}
		if (!this.#config.value) {
			return done({ warnings: this.#config.warnings });
		}

		// Process the bundlers configuration
		const config = this.#config.value;

		// Just for backward compatibility ('name' as subpath synonimous)
		config.subpath = config.subpath ? config.subpath : config.name;
		let subpath = typeof config.subpath === 'string' ? config.subpath : this.rpath;
		subpath = subpath.startsWith('.') ? subpath : `./${subpath}`;

		// Validate subpath
		const validate = /^\.\/[a-zA-Z0-9-_./]*$/;
		if (!subpath || (subpath !== '.' && !subpath.startsWith('./')) || !validate.test(subpath)) {
			const error =
				`Invalid subpath: "${subpath}". ` +
				`Subpath must be a non-empty string starting with './' and contain only valid characters.`;
			const errors = [error];
			return done({ errors });
		}

		delete config.name;
		delete config.subpath;
		delete config.title; // This property is not longer be used, avoid to detect it as a bundler

		// For backward compatibility, the bundler property is used to define it, instead of the `bundle` property
		config.bundler = config.bundle ? config.bundle : config.bundler;
		delete config.bundle; // Avoid to detect it as a bundler

		const bundlers = new Map();

		// At this point, all the common properties are removed from the config object
		if (config.bundler) {
			/**
			 * When the bundler is specified, then only one bundler is specified in the entry,
			 * so convert the entry to {bundler: ...}
			 */
			const specs = { bundler: config.bundler, subpath };
			for (const property of Object.keys(config)) {
				if (property === 'bundler') continue;
				if (property === 'subpath') continue; // It is invalid to define a subpath in the bundler specs

				// Move the property to the bundler specs
				specs[property] = config[property];
			}

			bundlers.set(config.bundler, specs);
		} else {
			const entries = Object.entries(config);

			const common = { description: config.description };
			delete config.description;

			// At this point, all the properties of the config object should be the bundlers configuration
			for (const [name, config] of entries) {
				if (typeof config !== 'object') {
					const warning = `Invalid bundler "${name}" configuration. The configuration must be an object.`;
					this.#warnings.push(warning);
					continue;
				}

				const specs = Object.assign({ bundler: name }, config, common);
				specs.subpath = entries.length > 1 ? `${subpath}.${bundlerName}` : subpath;
				bundlers.set(name, specs);
			}
		}

		// To uniquely identify the bundler over all the entries in the wordspace
		bundlers.forEach((specs, name) => Object.assign(specs, { id: crc32(`${this.path}:${name}`) }));

		const updated = new Map();
		bundlers.forEach((values, name) => {
			const specs = this.has(name) ? this.get(name) : new BundlerSpecs();
			updated.set(name, specs);
			specs.values = values;
		});

		return done({ updated, warnings: this.#warnings });
	}
};
