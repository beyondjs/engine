const Packages = require('./packages');
const { Config } = require('@beyond-js/config');
const fs = require('fs');

module.exports = class {
	#path;
	get path() {
		return this.#path;
	}

	#config;
	get config() {
		return this.#config;
	}

	get errors() {
		return this.#config.errors;
	}

	get warnings() {
		return this.#config.warnings;
	}

	#destroyed = false;
	get destroyed() {
		return this.#destroyed;
	}

	#packages;
	get packages() {
		return this.#packages;
	}

	/**
	 * BeyondJS Packages
	 * @param path {string} The directory where the instance is running
	 */
	constructor(path) {
		if (!path) throw new Error('Parameter "path" was expected');
		if (!fs.existsSync(path)) {
			throw new Error(`Workspace directory "${path}" does not exist`);
		}
		if (!fs.statSync(path).isDirectory()) {
			throw new Error(`Workspace path "${path}" is not a valid directory`);
		}

		this.#path = path;
		const config = new Config(path, {
			'/packages': 'array',
			'/packages/children/bundlers': 'object',
			'/packages/children/modules': 'object',
			'/packages/children/modules/externals': 'object',
			'/packages/children/transversals': 'object',
			'/packages/children/static': 'object',
			'/packages/children/libraries': 'object'
		});
		this.#config = config;
		this.#config.data = 'beyond.json';

		this.#packages = new Packages(config.get('packages'));
	}

	destroy() {
		if (this.#destroyed) throw new Error('Core is already destroyed');
		this.#destroyed = true;
		this.removeAllListeners();
		this.#config.destroy();
	}
};
