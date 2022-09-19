module.exports = class {
    // Listeners of the forked processes messages
    #listeners;

    constructor(dispatchers) {
        this.#listeners = new (require('./listeners'))(this, dispatchers);
    };

    #handlers = new Map;

    handle = (action, listener) => this.#handlers.set(action, listener);
    off = action => this.#handlers.delete(action);

    has = action => this.#handlers.has(action);

    /**
     * Register a forked process to hear for actions requests
     *
     * @param name {string} The name assigned to the forked process
     * @param fork {object} The forked process
     */
    registerFork = (name, fork) => this.#listeners.register(name, fork);

    async exec(action, ...params) {
        if (!(action)) throw new Error(`Action parameter must be set`);
        if (!this.#handlers.has(action)) throw new Error(`Action "${action}" not set`);

        // Execute the action
        return await (this.#handlers.get(action))(...params);
    }

    destroy() {
        this.#listeners.destroy();
    }
}
