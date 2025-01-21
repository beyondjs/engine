const packages = require('@beyond-js/uimport/packages');
const DynamicProcessor = require('@beyond-js/dynamic-processor')();

module.exports = class extends DynamicProcessor {
	get dp() {
		return 'application.package_json.dependency';
	}

	#pkg;
	get pkg() {
		return this.#pkg;
	}

	#kind;
	get kind() {
		return this.#kind;
	}

	get version() {
		return this.#pkg?.version;
	}

	#processed = false;
	#error;

	get error() {
		return this.#error || this.#pkg.error;
	}

	get valid() {
		return !this.#error && !this.#pkg.error;
	}

	constructor(application, pkg, kind) {
		super();

		this.#pkg = packages.get(pkg, { cwd: application.path });
		this.#kind = kind;

		const done = () => (this.#processed = true) && this._invalidate();
		this.#pkg
			.process()
			.then(done)
			.catch(exc => {
				this.#error = `Error processing package: ${exc.message}`;
				console.error(exc.stack);
				done();
			});
	}

	_prepared() {
		return this.#processed;
	}
};
