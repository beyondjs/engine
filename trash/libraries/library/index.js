/**
 * The application library
 */
module.exports = class extends require('./attributes') {
	get is() {
		return 'library';
	}

	#package;
	get package() {
		return this.#package;
	}

	#dependency;
	get dependency() {
		return this.#dependency;
	}

	#library;
	get library() {
		return this.#library;
	}

	get watcher() {
		return this.#package.watcher;
	}

	#modules;
	get modules() {
		return this.#modules;
	}

	#bundles;
	get bundles() {
		return this.#bundles;
	}

	#_static;
	get static() {
		return this.#_static;
	}

	host = distribution => this.#library.host(distribution);

	#errors = [];
	get errors() {
		return this.#errors;
	}

	get valid() {
		return !this.#errors.length;
	}

	/**
	 * Application library constructor
	 *
	 * @param package {object} The package object
	 * @param dependency {string} The package name of the dependency
	 */
	constructor(pkg, dependency) {
		super(application, dependency);
		this.#package = pkg;
		this.#dependency = dependency;

		this.#modules = new (require('./modules'))(this);
		this.#modules.on('change', () => this._events.emit('modules.change'));

		this.#_static = new (require('./static'))(this);
		this.#bundles = new SDK.Bundles(this);

		super.setup(new Map([['workspace', { child: pkg.workspace }]]));
	}

	_prepared(require) {
		const { workspace } = this.#package;

		let prepared = true;
		workspace.forEach(pkg => (prepared = require(pkg) && prepared));
		if (!prepared) return;

		this.#library = [...workspace.values()].find(pkg => pkg.package === this.#dependency);
		this.#library && require(this.#library);
	}

	_process() {
		this.#errors = [];
		!this.#library && this.#errors.push([`Project package "${this.#dependency}" not found`]);

		this.#modules.library = this.#library;
		this.#_static.library = this.#library;
	}

	destroy() {
		super.destroy();
		this.#modules.destroy();
		this.#bundles.destroy();
		this.#_static.destroy();
	}
};
