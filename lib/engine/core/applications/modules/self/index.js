const {FinderCollection} = global.utils;
const {relative} = require('path');

/**
 * Collection of application's own modules
 */
module.exports = class extends FinderCollection {
    #application;
    get application() {
        return this.#application;
    }

    #config;
    get config() {
        return this.#config;
    }

    get rpath() {
        if (!this.path) return;
        return relative(this.#application.path, this.path);
    }

    constructor(application, config) {
        super(application.watcher, require('./module'), {items: {subscriptions: ['change']}});
        this.#application = application;
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

        // Create the files watcher of the application
        const config = this.#config;
        !config.initialised && await config.initialise();

        await super.initialise();
        this.#initialising = false;
    }

    #configure = () => {
        const config = this.#config;
        if (!config.valid || !config.value) {
            super.configure();
            return;
        }
        super.configure(config.path, {filename: 'module.json', excludes: ['./builds', 'node_modules']});
    }

    destroy() {
        super.destroy();
        this.#config.off('initialised', this.#configure);
        this.#config.off('change', this.#configure);
    }
}
