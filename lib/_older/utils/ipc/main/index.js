module.exports = class {
    #dispatchers = new Map;

    #server = new (require('./server'))(this.#dispatchers);
    handle = (action, listener) => this.#server.handle(action, listener);
    removeHandler = action => this.#server.off(action);

    #events = new (require('./events'));
    get events() {
        return this.#events;
    }

    notify(...params) {
        this.#events.emit(...params);
    }

    register(name, fork) {
        if (!name || !fork) {
            throw new Error('Invalid parameters');
        }

        if (this.#dispatchers.has(name)) {
            throw new Error(`Process "${name}" already registered`);
        }

        this.#dispatchers.set(name, new (require('../dispatcher'))(fork));
        this.#server.registerFork(name, fork);
        this.#events.registerFork(name, fork);
    }

    unregister(name) {
        if (!this.#dispatchers.has(name)) throw new Error(`Process ${name} not found`);
        const dispatcher = this.#dispatchers.get(name);
        dispatcher.destroy();
        this.#dispatchers.delete(name);
    }

    /**
     * Execute an IPC action
     *
     * @param target {string | undefined} The name of the target process
     * @param action {string} The name of the action being requested
     * @param params {object} The parameters of the action
     * @returns {*}
     */
    async exec(target, action, ...params) {
        if (target === 'main') {
            // It is possible to execute an action from the main process directly
            // to an action of the main process
            return await this.#server.exec(action, ...params);
        }

        if (!this.#dispatchers.has(target)) throw new Error(`Target process "${target}" not found`);

        // Execute the action in one of the registered processes
        const dispatcher = this.#dispatchers.get(target);
        return await dispatcher.exec(undefined, action, ...params);
    }

    destroy() {
        this.#dispatchers.forEach(dispatcher => dispatcher.destroy());
    }
}
