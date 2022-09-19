const chokidar = require('chokidar');

/**
 * Recursive fs watcher to listen for file changes
 */
module.exports = class {
    #container;
    #watcher;

    get path() {
        return this.#container.path;
    }

    #listeners = new (require('./listeners'));
    get listeners() {
        return this.#listeners;
    }

    #ready = false;
    get ready() {
        return this.#ready;
    }

    /**
     * Watcher constructor
     *
     * @param container {object} The container to watch for files changes
     */
    constructor(container) {
        this.#container = container;

        const {path} = container;
        const options = {
            ignored: path => path.endsWith('node_modules') || path.endsWith('builds') ||
                path.endsWith('.builds') || path.endsWith('.beyond')
        };
        const watcher = chokidar.watch([path], options);

        this.#watcher = watcher;
        const listeners = this.#listeners;

        const add = (file, stats) => this.#ready && listeners.change('add', file, stats);
        const unlink = (file, stats) => this.#ready && listeners.change('unlink', file, stats);
        const change = (file, stats) => this.#ready && listeners.change('change', file, stats);

        watcher.on('ready', () => (this.#ready = true));
        watcher.on('add', add);
        watcher.on('unlink', unlink);
        watcher.on('change', change);
    }

    /**
     * Unregister all the listeners of a client id
     * @param client {number} The client id
     */
    unregisterListeners = client => this.#listeners.unregisterListeners(client);

    // Chokidar watcher .close method is async
    destroy() {
        this.#watcher.close().catch(exc => console.log(exc.stack));
    }
}
