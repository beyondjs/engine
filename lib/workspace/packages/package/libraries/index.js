const ipc = require('@beyond-js/ipc/main');
const DynamicProcessor = require('@beyond-js/dynamic-processor')(Array);

/**
 * The collection of internal dependencies of the package
 */
module.exports = class extends DynamicProcessor {
	get dp() {
		return 'package.libraries.imports';
	}

	#package;
	get package() {
		return this.#package;
	}

	#errors = [];
	get errors() {
		return this.#errors;
	}

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	#modules;
	get modules() {
		return this.#modules;
	}

	/**
	 * Package internal dependencies constructor
	 *
	 * @param package {object} The package
	 * @param config {object} The package libraries configuration
	 */
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
		const previous = this.slice();
		this.length = 0;

		const done = () => {
			const changed = !(equal(previous, this.slice()) && equal(this.#errors, config.errors));
			return changed;
		};

		if (!config.valid) {
			this.#errors = config.errors;
			return done();
		}

		const value = Object.assign({}, config.value);
		value.imports = value.imports ? value.imports : [];
		if (!(value.imports instanceof Array)) {
			this.#warnings.push('Invalid libraries imports configuration');
			value.imports = [];
		}

		value.imports.forEach(dependency => this.push(dependency));

		return done();
	}

	_notify() {
		ipc.notify('data-notification', {
			type: 'list/update',
			table: 'packages-libraries',
			filter: { package: this.#package.id }
		});
	}
};
