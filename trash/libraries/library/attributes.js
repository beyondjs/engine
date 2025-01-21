const DynamicProcessor = require('@beyond-js/dynamic-processor')();

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'library';
	}

	get is() {
		return 'library';
	}

	#package;

	#dependency;
	get dependency() {
		return this.#dependency;
	}

	get id() {
		return `${this.#package.id}/${this.#dependency}`;
	}

	get version() {
		return this.library?.version;
	}

	get specifier() {
		return this.#dependency;
	}

	get vspecifier() {
		return `${this.#dependency}@${this.library?.version}`;
	}

	get path() {
		return this.library?.path;
	}

	get pathname() {
		return this.library?.pathname;
	}

	get description() {
		return this.library?.description;
	}

	get connect() {
		return this.library?.connect;
	}

	get hosts() {
		return this.library?.hosts;
	}

	constructor(pkg, dependency) {
		super();
		this.#package = pkg;
		this.#dependency = dependency;
	}
};
