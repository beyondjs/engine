const { Config } = require('@beyond-js/config');
const fs = require('fs');
const EventEmitter = require('events');

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

	#workspace;
	get workspace() {
		return this.#workspace;
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

		this.#workspace = new (require('./workspace'))(config.get('workspace'));
	}

	destroy() {
		if (this.#destroyed) throw new Error('Core is already destroyed');
		this.#destroyed = true;
		this.removeAllListeners();
		this.#config.destroy();
	}
};
