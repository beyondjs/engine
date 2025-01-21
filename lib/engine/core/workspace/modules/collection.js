const { FinderCollection } = require('@beyond-js/finder');
const Module = require('./module');

/**
 * Collection of modules of the package
 */
module.exports = class extends FinderCollection {
	#package;
	get package() {
		return this.#package;
	}

	#config;
	get config() {
		return this.#config;
	}

	constructor(pkg, config) {
		super(pkg.watcher, Module, { items: { subscriptions: ['change'] } });
		this.#config = config;

		config.on('initialised', this.#configure);
		config.on('change', this.#configure);
		config.initialised && this.#configure();
	}

	#initialising = false;
	get initialising() {
		return this.#initialising || super.initialising;
	}

	async initialise() {
		if (this.initialised || this.#initialising) return;
		this.#initialising = true;

		// Create the files watcher of the package
		const config = this.#config;
		!config.initialised && (await config.initialise());

		await super.initialise();
		this.#initialising = false;
	}

	#configure = () => {
		const config = this.#config;
		if (!config.valid || !config.value) {
			super.configure();
			return;
		}
		super.configure(config.path, { filename: 'module.json', excludes: ['./builds', 'node_modules'] });
	};

	destroy() {
		super.destroy();
		this.#config.off('initialised', this.#configure);
		this.#config.off('change', this.#configure);
	}
};
