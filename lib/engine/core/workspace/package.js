const BackgroundWatcher = require('@beyond-js/watchers/client');

module.exports = class extends require('./attributes') {
	#workspace;
	get workspace() {
		return this.#workspace;
	}

	#watcher;
	get watcher() {
		return this.#watcher;
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

	#config;
	get config() {
		return this.#config;
	}

	#libraries;
	get libraries() {
		return this.#libraries;
	}

	#modules;
	get modules() {
		return this.#modules;
	}

	#_static;
	get static() {
		return this.#_static;
	}

	#resources = new (require('./resources'))(this);
	get resources() {
		return this.#resources;
	}

	#builder = new (require('./builder'))(this);
	get builder() {
		return this.#builder;
	}

	#ssr;
	get ssr() {
		return this.#ssr;
	}

	#widgets;
	get widgets() {
		return this.#widgets;
	}

	#consumers;
	get consumers() {
		return this.#consumers;
	}

	#bundlers;
	get bundlers() {
		return this.#bundlers;
	}

	async _begin() {
		await super._begin();

		// Create the files watcher of the package
		const config = this.children.get('config').child;
		await config.initialise();

		this.#watcher = new BackgroundWatcher({ is: 'package', path: config.path });
		this.#watcher.start().catch(exc => console.error(exc.stack));

		const cfg = {
			bundlers: config.properties.get('bundlers'),
			libraries: config.properties.get('libraries'),
			static: config.properties.get('static'),
			modules: config.properties.get('modules')
		};

		this.#bundlers = new (require('./bundlers'))(this, cfg.bundlers);
		this.#libraries = new (require('./libraries'))(this, cfg.libraries);
		this.#_static = new (require('./static'))(this, cfg.static);
		this.#modules = new (require('./modules'))(this, cfg.modules);
		this.#ssr = new (require('./ssr'))(this);
		this.#widgets = new (require('./widgets'))(this);
		this.#consumers = new (require('./consumers'))(this);
	}

	constructor(config, workspace) {
		super(config);
		this.#workspace = workspace;
		this.#config = new (require('./config/'))(this);

		// As the modules are subscribed to the events of the package, then
		// it is required to increase the number of listeners
		this._events.setMaxListeners(500);
	}

	_process() {
		const { warnings, errors, valid, value } = this.children.get('config').child;
		this.#warnings = warnings;
		this.#errors = errors;

		const config = !valid || !value ? {} : value;
		super._process(config);
	}

	host(distribution) {
		const { hosts } = this;
		return typeof hosts === 'object' ? hosts[distribution.environment] : hosts;
	}

	destroy() {
		super.destroy();
		this.#watcher.destroy();
		this.#_static.destroy();
		this.#modules.destroy();
	}
};
