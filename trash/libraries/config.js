const equal = require('@beyond-js/equal');
const DynamicProcessor = require('@beyond-js/dynamic-processor')();

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.libraries.config';
	}

	#package;
	#value;

	get imports() {
		return this.#value.imports;
	}

	#errors = [];
	get errors() {
		return this.#errors;
	}

	get valid() {
		return !this.#errors.length;
	}

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	constructor(pkg, config) {
		super();
		this.#package = pkg;

		const children = new Map();
		children.set('config', { child: config });
		super.setup(children);
	}

	_process() {
		const config = this.children.get('config').child;
		this.#warnings = config.warnings;

		if (!config.valid) {
			this.#errors = config.errors;
			this.#value = {};
			return;
		}

		const value = Object.assign({}, config.value);
		value.imports = value.imports ? value.imports : [];
		if (!(value.imports instanceof Array)) {
			this.#warnings.push('Invalid libraries imports configuration');
			value.imports = [];
		}

		if (equal(value, this.#value)) return false;
		this.#value = value;
	}
};
