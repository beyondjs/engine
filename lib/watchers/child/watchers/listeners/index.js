const Listener = require('./listener');

module.exports = class {
    #listeners = new Map();
    #watcher;

    constructor(watcher) {
        this.#watcher = watcher;
    }

    create(path, filter) {
        const listeners = this.#listeners;
        const listener = new Listener(this.#watcher, path, filter);
        listener.on('destroyed', () => this.#listeners.delete(path));
        listeners.set(path, listener);
        return listener;
    }

    delete(id) {
        const listeners = this.#listeners;
        if (!listeners.has(id)) throw new Error(`Listener with id "${id}" is not registered`);
        const listener = listeners.get(id);
        !listener.destroyed && listener.destroy();
        listeners.delete(id);
    }

    destroy() {
        const listeners = this.#listeners;
        listeners.forEach(listener => !listener.destroyed && listener.destroy());
        listeners.clear();
    }
}
