const { join } = require('path');

module.exports = class Templates {
	#path;
	#ready;
	static #instance;

	get ready() {
		return this.#ready;
	}

	get path() {
		return this.#path;
	}

	/**
	 * get the templates from the @beyond-js/scaffolding package
	 */
	get templatesPackage() {
		return '@beyond-js/scaffolding';
	}

	constructor(path) {
		if (path) {
			this.#ready = true;
			this.#path = path;
			return;
		}
		this.load();
	}

	async #getPath() {
		const path = await require('./path')();
		this.#path = join(path, this.templatesPackage, 'templates');

		return (this.#ready = true);
	}

	async load() {
		return this.#getPath();
	}

	ipc() {
		return require('../../../ipc-manager');
	}

	static get(path) {
		if (!Templates.#instance) {
			Templates.#instance = new Templates(path);
		}
		return Templates.#instance;
	}
};
