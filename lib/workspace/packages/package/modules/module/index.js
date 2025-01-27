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

	#id;
	get id() {
		return this.#id;
	}

	#bundler = {};
	get bundler() {
		return this.#bundler;
	}

	#config;
	#values = {};
	get subpath() {
		return this.#values.subpath;
	}

	get description() {
		return this.#values.description;
	}

	#exports = new Map();
	get exports() {
		return this.#exports;
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
		return !this.#errors.length;
	}

	constructor(pkg, file, id, bundler) {
		super();
		this.#package = pkg;
		this.#file = file;
		this.#id = id;
		this.#bundler.id = bundler;

		super.setup(new Map([['bundlers', { child: pkg.bundlers }]]));
	}

	_notify = () => ipc.notify('data-notification', { type: 'record/update', table: 'modules', id: this.id });

	configure(config) {
		const values = { subpath: config.subpath, description: config.description };
		const changed = !equal(values, this.#values);
		changed && this._invalidate();

		this.#config = config;
		this.#bundler?.processor?.configure?.(config);
	}

	_process() {
		const done = ({ errors, warnings, bundler }) => {
			const previous = { errors: this.#errors, warnings: this.#warnings, bundler: !!this.#bundler.processor };
			const changed = equal({ errors, warnings, bundler: !!bundler }, previous);

			this.#errors = errors ? errors : [];
			this.#warnings = warnings ? warnings : [];
			this.#bundler.processor = bundler;
			return changed;
		};

		const { bundlers } = this.#package;
		if (!bundlers.has(this.#bundler.id)) {
			return done({ errors: `Bundler "${this.#bundler.id}" not found` });
		}

		if (this.#bundler.processor) return done({ bundler: this.#bundler.processor });

		const { meta, settings } = bundlers.get(this.#bundler.id);
		const specs = { module: this, settings };

		let Bundler;
		if (typeof meta === 'function') {
			Bundler = meta;
		} else if (typeof meta === 'object') {
			if (typeof meta.Bundler !== 'function') {
				return done({ errors: `Bundler package didn't return a Bundler class` });
			}
			Bundler = meta.Bundler;
		}

		const bundler = new Bundler(specs);
		bundler.configure?.(this.#config);
		return done({ bundler });
	}
};
