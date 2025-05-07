const BackgroundWatcher = require('@beyond-js/watchers/client');
const Bundlers = require('./bundlers');
const Modules = require('./modules');
const Libraries = require('./libraries');
const Static = require('./static');
const Builder = require('./builder');

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

	#bundlers;
	get bundlers() {
		return this.#bundlers;
	}

	#modules;
	get modules() {
		return this.#modules;
	}

	#libraries;
	get libraries() {
		return this.#libraries;
	}

	#_static;
	get static() {
		return this.#_static;
	}

	#builder;
	get builder() {
		return this.#builder;
	}

	async _begin() {
		await super._begin();

		// Create the files watcher of the package
		const { config } = this;
		this.#watcher = this.#workspace.specs.watchers && new BackgroundWatcher({ is: 'package', path: config.path });
		this.#watcher?.start().catch(exc => console.error(exc.stack));

		const cfg = {
			bundlers: config.properties.get('bundlers'),
			libraries: config.properties.get('libraries'),
			static: config.properties.get('static'),
			modules: config.properties.get('modules')
		};

		this.#bundlers = new Bundlers(this, cfg.bundlers);
		this.#modules = new Modules(this, cfg.modules);
		this.#_static = new Static(this, cfg.static, this.#modules);
		this.#libraries = new Libraries(this, cfg.libraries);
		this.#builder = new Builder(this);
	}

	constructor(workspace, config) {
		super(config);
		this.#workspace = workspace;

		// As the modules are subscribed to the events of the package, then
		// it is required to increase the number of listeners
		this._events.setMaxListeners(500);
	}

	_process() {
		const { warnings, errors, valid, value } = this.config;
		this.#warnings = warnings;
		this.#errors = errors;

		const config = !valid || !value ? {} : value;
		super._process(config);
	}

	destroy() {
		super.destroy();
		this.#watcher.destroy();
		this.#bundlers.destroy();
		this.#modules.destroy();
		this.#libraries.destroy();
		this.#_static.destroy();
	}
};
