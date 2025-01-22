const Packages = require('./packages');
const { Config } = require('@beyond-js/config');
const Watchers = require('@beyond-js/watchers/service');
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

	#specs;
	get specs() {
		return this.#specs;
	}

	/**
	 * BeyondJS Packages
	 * @param path {string} The directory where the instance is running
	 * @param specs {watchers: boolean = false} Options
	 */
	constructor(path, specs) {
		if (!path) throw new Error('Parameter "path" was expected');
		if (!fs.existsSync(path)) {
			throw new Error(`Workspace directory "${path}" does not exist`);
		}
		if (!fs.statSync(path).isDirectory()) {
			throw new Error(`Workspace path "${path}" is not a valid directory`);
		}

		// Initialise the watchers service
		this.#specs = specs = specs ? specs : {};
		specs.wathcers && new Watchers('watchers');

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

		this.#packages = new Packages(this, config.get('packages'));
	}

	destroy() {
		if (this.#destroyed) throw new Error('Core is already destroyed');
		this.#destroyed = true;
		this.removeAllListeners();
		this.#config.destroy();
	}
};
