const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const ipc = require('@beyond-js/ipc/main');
const crc32 = require('@beyond-js/crc32');
const equal = require('@beyond-js/equal');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package';
	}

	#id;
	get id() {
		return this.#id;
	}

	#config;
	get config() {
		return this.#config;
	}

	get path() {
		return this.#config.path;
	}

	#values = {};

	get name() {
		return this.#values.name;
	}

	get version() {
		return this.#values.version;
	}

	get description() {
		return this.#values.description;
	}

	get keywords() {
		return this.#values.keywords;
	}

	get author() {
		return this.#values.author;
	}

	get license() {
		return this.#values.license;
	}

	get repository() {
		return this.#values.repository;
	}

	_notify = () => {
		ipc.notify('data-notification', {
			type: 'record/update',
			table: 'packages',
			id: this.#id
		});
	};

	constructor(config) {
		super();
		super.setup(new Map([['config', { child: config }]]));

		this.#config = config;
		this.#id = crc32(this.path);
	}

	_process(config) {
		const { name, version, description, keywords, author, license, repository } = config;
		const values = { name, version, description, keywords, author, license, repository };

		if (equal(values, this.#values)) return false;
		this.#values = values;
	}
};
