const { Config } = require('@beyond-js/config');
const equal = require('@beyond-js/equal');
const sep = require('path').sep;

module.exports = class extends DynamicProcessor {
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
		let rpath = file.relative.dirname;
		rpath = sep === '/' ? rpath : rpath.replace(/\\/g, '/');
		return rpath.replace(/\/$/, ''); // Remove trailing slash;
	}

	#config;

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
		this.#package = finder.package;
		this.#file = file;

		const config = (this.#config = new Config(file.dirname, { '/static': 'object' }));
		config.data = 'module.json';
		super(config);
	}

	_process() {
		let config = this.#config;
		this.#warnings = config.warnings.slice();
		this.#errors = config.errors.slice();
		config = !config.valid || !config.value ? { modules: {} } : require('./config')(config.value);
	}
};
