module.exports = class {
    #watchers = require('./watchers');
    #container;
    get container() {
        return this.#container;
    }

    #watcher;

    get id() {
        return this.#watcher.id;
    }

    get started() {
        return this.#watcher.started;
    }

    get listeners() {
        return this.#watcher.listeners;
    }

    constructor(container) {
        if (typeof container !== 'object') throw new Error('Invalid parameter container');
        this.#container = container;

        const {path} = container;
        if (typeof path !== 'string') throw new Error('Non-string provided as watch path');
        if (!path) throw new Error('Empty string provided as watch path');

        this.#watcher = this.#watchers.get(container);
    }

    start = () => this.#watcher.start();
    destroy = () => this.#watchers.unregister(this.#container);
}
