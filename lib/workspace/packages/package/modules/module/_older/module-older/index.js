const BundlesConfig = require('./bundles-config');

module.exports = class extends require('./attributes') {
	get watcher() {
		return this.container.watcher;
	}

	#file;
	#container;
	get container() {
		return this.#container;
	}

	get version() {
		return this.#container.version;
	}

	get file() {
		return this.#file;
	}

	#id;
	get id() {
		return this.#id;
	}

	#errors = [];
	get errors() {
		return this.#errors;
	}

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	#bundles;
	get bundles() {
		return this.#bundles;
	}

	#_static;
	get static() {
		return this.#_static;
	}

	get application() {
		return this.#container.is === 'application' ? this.#container : this.#container.application;
	}

	constructor(container, file) {
		this.#bundles = new BundlesConfig(this);

		this.#_static = new (require('./static'))(this, config.properties.get('static'));
	}

	destroy() {
		super.destroy();
		this.#_static.destroy();
	}
};
