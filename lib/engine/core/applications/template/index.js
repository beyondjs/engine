/**
 * Resources manager of the template of the application
 */
module.exports = class {
	#config;

	get path() {
		return this.#config.path;
	}

	#overwrites;
	get overwrites() {
		return this.#overwrites;
	}

	constructor(application, config) {
		this.#config = config;
		this.#overwrites = new (require('./overwrites'))(application, config.properties.get('overwrites'));
	}

	initialise() {
		this.#overwrites.initialise().catch(exc => console.log(exc.stack));
	}

	destroy() {
		this.#overwrites.destroy();
	}
};
