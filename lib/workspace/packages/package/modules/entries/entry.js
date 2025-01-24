const DynamicProcessor = require('@beyond-js/dynamic-processor')();
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

	get path() {
		return this.#file.dirname;
	}

	/**
	 * The normalized relative path of the module
	 */
	get rpath() {
		let rpath = this.#file.relative.dirname;
		rpath = sep === '/' ? rpath : rpath.replace(/\\/g, '/');
		return rpath.replace(/\/$/, ''); // Remove trailing slash;
	}

	#bundlers;
	get bundlers() {
		return new Map(Object.entries(this.#bundlers));
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
		const done = ({ bundlers, errors, warnings }) => {
			const changed = equal(
				{ bundlers, errors, warnings },
				{ bundlers: this.#bundlers, errors: this.#errors, warnings: this.#warnings }
			);

			this.#warnings = warnings ? warnings : [];
			this.#errors = errors ? errors : [];
			this.#bundlers = bundlers;
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

		// The common properties that apply to the entry level, so apply to all the bundlers
		const common = (() => {
			// Just for backward compatibility
			config.subpath = config.subpath ? config.subpath : config.name;
			delete config.name;

			const properties = ['subpath', 'description', 'platforms', 'static'];

			const common = {};
			properties.forEach(property => {
				config.hasOwnProperty(property) && (common[property] = config[property]);
				delete config[property];
			});

			common.platforms = typeof common.platforms === 'string' ? [common.platforms] : common.platforms;
			common.platforms = common.platforms ? common.platforms : ['default'];
			return common;
		})();

		const bundlers = {};

		// At this point, all the common properties are removed from the config object
		if (config.bundler) {
			/**
			 * When the bundler is specified, then only one bundler is specified in the entry,
			 * so convert the entry to {bundler: ...}
			 */
			const bundler = Object.assign({ bundler: config.bundler }, common);
			for (const property of Object.keys(config)) {
				if (property === 'bundler') continue;

				// All this properties are properties of the bundler, so copy the property there
				bundler[property] = config[property];
			}
			bundlers[config.bundler] = bundler;
		} else {
			const entries = Object.entries(config);

			// At this point, all the properties of the config object should be the bundlers configuration
			for (const [bundlerName, bundlerConfig] of entries) {
				bundlers[bundlerName] = Object.assign({ bundler: bundlerName }, bundlerConfig, common);

				if (entries.length > 1) {
					const { subpath } = bundlers[bundlerName];
					bundlers[bundlerName].subpath = `${subpath}.${bundlerName}`;
				}
			}
		}

		// To uniquely identify the bundler,
		// we do so through the relative location of the entry on disk and the name of the bundler.
		Object.entries(bundlers).forEach(([name, config]) => (config.id = `${this.rpath}:${name}`));

		return done({ bundlers, warnings: this.#warnings });
	}
};
