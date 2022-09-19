const Listener = require('./listener');

module.exports = class {
    #listeners = new Map();

    /**
     *  Creates a new listener
     *
     * @param client {number} The client id of the watcher being used
     * @param path {string} The folder to be listening
     * @param filter {object} The filter being applied to the listener
     * @returns {module.exports}
     */
    create(client, path, filter) {
        const listener = new Listener(client, path, filter);
        this.#listeners.set(listener.id, listener);
        return listener;
    }

    unregisterListeners(client) {
        const listeners = this.#listeners;
        listeners.forEach((listener, key) =>
            listener.client === client && listeners.delete(key));
    }

    stop(id) {
        const listeners = this.#listeners;
        if (!listeners.has(id)) throw new Error(`Listener "${id}" is not registered`);
        listeners.delete(id);
    }

    // Called by the watcher when a change is fired
    change = (event, file, stats) => this.#listeners.forEach(
        listener => listener.change(event, file, stats));
}
