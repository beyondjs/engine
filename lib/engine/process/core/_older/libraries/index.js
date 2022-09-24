const {ipc} = global.utils

module.exports = class extends global.utils.ConfigCollection {
    get dp() {
        return 'libraries';
    }

    #propagator;
    #defaults = (require('./defaults'));

    constructor(...params) {
        super(...params);
        this.setMaxListeners(30);
        this.#propagator = new (require('./propagator'))(this._events);
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
     * Find a library by its name
     * @param pkg {string} The library package identification
     */
    async find(pkg) {
        // Wait for all libraries to be ready
        const promises = [];
        await this.ready;
        this.forEach(library => promises.push(library.ready));
        await Promise.all(promises);

        return [...this.values()].find(library => library.package === pkg);
    }

    _notify() {
        ipc.notify('data-notification', {
            type: 'list/update',
            table: 'libraries'
        });
    }

    _processConfig(items) {
        this.#defaults.forEach((library, path) => !items.has(path) && items.set(path, library));
        return items;
    }

    _createItem(config) {
        const library = new (require('./library'))(config);
        this.#propagator.subscribe(library);
        return library;
    }

    _deleteItem(library) {
        this.#propagator.unsubscribe(library);
        super._deleteItem(library);
    }
}
