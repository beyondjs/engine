const ipc = require('@beyond-js/ipc/main');
const equal = require('@beyond-js/equal');

module.exports = class {
	#file;
	get file() {
		return this.#file;
	}

	#id;
	get id() {
		return this.#id;
	}

	#bundler;
	get bundler() {
		return this.#bundler;
	}

	#values = {};
	get subpath() {
		return this.#values.subpath;
	}

	get description() {
		return this.#values.description;
	}

	get platforms() {
		return this.#values.platforms;
	}

	constructor(file, id, bundler) {
		this.#file = file;
		this.#id = id;
		this.#bundler = bundler;
	}

	#notify = () => ipc.notify('data-notification', { type: 'record/update', table: 'modules', id: this.id });

	configure(config) {
		const values = { subpath: config.subpath, description: config.description, platforms: config.platforms };
		const changed = !equal(values, this.#values);

		changed && this.#notify();
		this.#values = values;
	}
};
