const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const equal = require('@beyond-js/equal');
const ipc = require('@beyond-js/ipc/main');
const { sep } = require('path');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'module';
	}

	#values = {};

	get subpath() {
		return this.#values.subpath;
	}

	get description() {
		return this.#values.description;
	}

	get platforms() {
		return new Set(this.#values.platforms);
	}

	_notify = () => ipc.notify('data-notification', { type: 'record/update', table: 'modules', id: this.id });

	constructor(config) {
		super();
		super.setup(new Map([['config', { child: config }]]));
	}

	_process(config) {
		config = config ? config : {};
		let { subpath, description, platforms } = config;

		// Process the subpath
		subpath === '' && (subpath = 'main');
		subpath = subpath ? subpath : this.rpath;

		// Process the platforms
		platforms = platforms ? platforms : ['default'];
		typeof platforms === 'string' ? [platforms] : platforms;

		const values = { subpath, description, platforms };

		if (equal(values, this.#values)) return false;
		this.#values = values;
	}
};
