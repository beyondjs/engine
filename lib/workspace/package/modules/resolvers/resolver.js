const DynamicProcessor = require('@beyond-js/dynamic-processor')();
const ipc = require('@beyond-js/ipc/main');
const equal = require('@beyond-js/equal');

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'module.resolver';
	}

	#package;
	get package() {
		return this.#package;
	}

	#file;
	#specs;

	get id() {
		return this.#specs.id;
	}

	#module;
	get module() {
		return this.#module;
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
		const done = ({ errors, warnings, module }) => {
			const previous = { errors: this.#errors, warnings: this.#warnings, module: !!this.#module };
			const changed = equal({ errors, warnings, module: !!module }, previous);

			this.#errors = errors ? errors : [];
			this.#warnings = warnings ? warnings : [];
			this.#module = module;
			return changed;
		};

		const { bundlers } = this.#package;
		const specs = this.#specs.values;
		if (!bundlers.has(specs.bundler)) {
			return done({ errors: `Module "${specs.bundler}" not found` });
		}

		if (this.#module) return done({ module: this.#module });

		const { meta, settings } = bundlers.get(specs.bundler);

		let Module;
		if (typeof meta === 'function') {
			Module = meta;
		} else if (typeof meta === 'object') {
			if (typeof meta.Module !== 'function') {
				return done({ errors: `Module package didn't return a Module class` });
			}
			Module = meta.Module;
		}

		const path = { dirname: this.#file.dirname, relative: this.#file.relative.dirname };
		const module = new Module({ package: this.#package, path, settings, specs: this.#specs });
		return done({ module });
	}

	destroy() {
		super.destroy();
		this.#module?.destroy();
	}
};
