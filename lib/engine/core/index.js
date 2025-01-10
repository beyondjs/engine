const { Config } = require('@beyond-js/config');
const fs = require('fs');
const EventEmitter = require('events');
const SDK = require('@beyond-js/bundles-sdk');
/**
 * BeyondJS core
 */
module.exports = class extends EventEmitter {
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

	#applications;
	get applications() {
		return this.#applications;
	}

	/**
	 * BeyondJS core constructor
	 * @param path {string} The directory where the instance is running
	 */
	constructor(path) {
		super();
		this.#path = path;

		if (!path) throw new Error('Invalid parameters');
		if (!fs.existsSync(path) && !fs.statSync(path).isDirectory()) {
			throw new Error('Root directory is invalid');
		}

		const config = new Config(path, {
			'/processors': 'object',
			'/packages': 'array',
			'/packages/children/deployment': 'object',
			'/packages/children/bundlers': 'object',
			'/packages/children/modules': 'object',
			'/packages/children/modules/externals': 'object',
			'/packages/children/transversals': 'object',
			'/packages/children/static': 'object',
			'/packages/children/libraries': 'object',
			'/packages/children/excludes': 'object',
			'/packages/children/template': 'object',
			'/packages/children/template/overwrites': 'object'
		});
		this.#config = config;
		this.#config.data = 'beyond.json';

		this.#applications = new (require('./applications'))(config.get('packages'));
	}

	destroy() {
		if (this.#destroyed) throw new Error('Core is already destroyed');
		this.#destroyed = true;
		this.removeAllListeners();
		this.#config.destroy();
	}
};
