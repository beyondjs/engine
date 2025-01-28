const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const ipc = require('@beyond-js/ipc/main');
const equal = require('@beyond-js/equal');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'module';
	}

	#package;
	get package() {
		return this.#package;
	}

	#file;
	get file() {
		return this.#file;
	}

	#specs;
	get specs() {
		return this.#specs;
	}

	get id() {
		return this.#specs.values?.id;
	}

	get subpath() {
		return this.#specs.values?.subpath;
	}

	get description() {
		return this.#specs.values?.description;
	}

	#bundler;
	get bundler() {
		return this.#bundler;
	}

	get exports() {
		return this.#bundler?.exports;
	}

	#errors = [];
	get errors() {
		return this.#errors;
	}

	#warnings = [];
	get warnings() {
		return this.#warnings;
	}

	get valid() {
		return !this.#errors?.length;
	}

	constructor(pkg, file, specs) {
		super();
		this.#package = pkg;
		this.#file = file;
		this.#specs = specs;

		super.setup(
			new Map([
				['bundlers', { child: pkg.bundlers }],
				['specs', { child: specs }]
			])
		);
	}

	_notify = () => ipc.notify('data-notification', { type: 'record/update', table: 'modules', id: this.id });

	_process() {
		const done = ({ errors, warnings, bundler }) => {
			const previous = { errors: this.#errors, warnings: this.#warnings, bundler: !!this.#bundler };
			const changed = equal({ errors, warnings, bundler: !!bundler }, previous);

			this.#errors = errors ? errors : [];
			this.#warnings = warnings ? warnings : [];
			this.#bundler = bundler;
			return changed;
		};

		const { bundlers } = this.#package;
		const specs = this.#specs.values;

		if (!bundlers.has(specs.bundler)) {
			return done({ errors: `Bundler "${specs.bundler}" not found` });
		}

		if (this.#bundler) return done({ bundler: this.#bundler });

		const { meta, settings } = bundlers.get(specs.bundler);

		let Bundler;
		if (typeof meta === 'function') {
			Bundler = meta;
		} else if (typeof meta === 'object') {
			if (typeof meta.Bundler !== 'function') {
				return done({ errors: `Bundler package didn't return a Bundler class` });
			}
			Bundler = meta.Bundler;
		}

		const bundler = new Bundler({ module: this, settings, specs: this.#specs });
		return done({ bundler });
	}

	destroy() {
		super.destroy();
		this.#bundler.processor?.destroy();
	}
};
