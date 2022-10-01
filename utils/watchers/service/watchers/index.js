let counter = 0;

module.exports = class {
    #watchers = {
        'paths': new Map(),       // [path - watcher] map
        'clients': new Map(),     // [watcher - client ids] map
        'client': new Map(),      // [clients id - watcher] map
        'containers': new Map()
    };

    has = id => this.#watchers.client.has(id);
    get = id => this.#watchers.client.get(id);

    create(container) {
        if (typeof container !== 'object') throw new Error(`Invalid parameters`);

        const watchers = this.#watchers;
        const {path} = container;

        /**
         * Get a previously created watcher or set a new one
         */
        let watcher;
        if (watchers.paths.has(path)) {
            watcher = watchers.paths.get(path);
        }
        else {
            const check = function (lower, higher) {
                if (higher.startsWith(`${lower}${sep}`)) {
                    lower = watchers.containers.get(lower);
                    higher = watchers.containers.get(higher);
                    console.warn(`Watcher of "${higher.is}" with path "${higher.path}" ` +
                        `could be using the wathcer of "${lower.is}" with path "${lower.path}"`);
                }
            };

            watcher = new (require('./watcher.js'))(container);
            watchers.paths.set(path, watcher);
            watchers.containers.set(path, container);

            // Check if a watcher is being created on a path that another watcher is already working
            const sep = require('path').sep;
            for (const previous of watchers.paths.keys()) {
                previous.length < path.length ? check(previous, path) : check(path, previous);
            }
        }

        /**
         * Set the client id
         */
        let ids; // array of clients ids attached to the same watcher
        if (watchers.clients.has(watcher)) {
            ids = watchers.clients.get(watcher);
        }
        else {
            ids = new Set;
            watchers.clients.set(watcher, ids);
        }

        const client = ++counter;
        ids.add(client);
        watchers.client.set(client, watcher);
        return client;
    }

    /**
     * Unregisters a watcher
     * @param id {number} The client id of the consumer of the watcher
     * @returns {Promise<void>}
     */
    async delete(id) {
        const watchers = this.#watchers;
        if (!watchers.client.has(id)) throw new Error(`Client "${id}" is not registered`);

        const watcher = watchers.client.get(id);
        const ids = watchers.clients.get(watcher);
        ids.delete(id);
        watcher.unregisterListeners(id);

        if (!ids.size) {
            watchers.clients.delete(watcher);
            watchers.paths.delete(watcher.path);
            await watcher.destroy();
        }

        watchers.client.delete(id);
    }
}
