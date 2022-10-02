const {ConfigCollection} = global.utils

/**
 * The collection of applications or libraries with beyond execution environment
 */
module.exports = class extends ConfigCollection {
    get dp() {
        return 'server.containers.collection';
    }

    #is;
    get is() {
        return this.#is;
    }

    #dashboard; // Is it the dashboard instance or not?
    get dashboard() {
        return this.#dashboard;
    }

    #defaults = (require('./defaults'));

    _notify() {
        // ipc.events.emit('data-notification', {});
    }

    _processConfig(items) {
        if (this.#is !== 'library') return super._processConfig(items);
        this.#defaults.forEach((library, path) => !items.has(path) && items.set(path, library));
        return items;
    }

    #initialising = false;
    get initialising() {
        return this.#initialising || super.initialising;
    }

    async initialise() {
        if (this.initialised || this.#initialising) return;
        this.#initialising = true;

        this.#defaults.ready;

        await super.initialise();
        this.#initialising = false;
    }

    /**
     * Containers collection constructor
     *
     * @param is {string} Can be 'application', 'library' or 'dashboard' (for the compiled dashboard)
     * @param config {object} The applications or libraries configuration
     * @param dashboard {boolean} Is it the instance of the Beyond JS dashboard
     */
    constructor(is, config, dashboard) {
        if (!['application', 'library', 'dashboard'].includes(is)) throw new Error('Invalid parameters');

        super(config);
        this.#is = is;
        this.#dashboard = dashboard;
    }

    _createItem(config) {
        if (!config.path) throw new Error(`Property "path" of config parameter was expected`);
        return new (require('./container'))(this.#is, config, this.#dashboard);
    }
}
