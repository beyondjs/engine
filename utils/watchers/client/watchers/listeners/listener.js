const {ipc} = global.utils;
const {EventEmitter} = require('events');

module.exports = class extends EventEmitter {
    #id;

    #watcher;
    #path;
    get path() {
        return this.#path;
    }

    #filter;

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    constructor(watcher, path, filter) {
        super();
        if (typeof path !== 'string') throw new Error('Invalid parameters');
        this.#watcher = watcher;
        this.#path = path;
        this.#filter = filter;
    }

    #promises = {};
    #change = event => this.emit(event.event, event.file);

    async listen() {
        if (this.#id) return this.#id; // Listener already started

        const promises = this.#promises;
        const watcher = this.#watcher;

        if (promises.start) return await promises.start.value;
        promises.start = Promise.pending();

        await watcher.start();
        if (!watcher.id) {
            const container = watcher.container;
            const message = `Watcher "${container.is}" on "${container.path}" not started`;
            console.log(message);
            promises.start.reject(new Error(message));
            return;
        }

        try {
            const specs = {watcher: watcher.id, path: this.#path, filter: this.#filter};
            this.#id = await ipc.exec('watchers', 'listeners.create', specs);
            ipc.events.on('watchers', `listener:${this.#id}.change`, this.#change);
            promises.start.resolve(this.#id);
        }
        catch (exc) {
            promises.start.reject(exc);
            throw exc;
        }
        finally {
            delete promises.start;
        }

        return this.#id;
    }

    async stop() {
        const promises = this.#promises;
        const watcher = this.#watcher;

        // If stopping the watcher when it is already starting, wait the start be completed
        if (promises.stop) await promises.stop.value;

        if (promises.stop) return await promises.stop.value;
        promises.stop = Promise.pending();

        if (!watcher.id) throw new Error('Watcher not started');

        // If stopping the listener when it is already starting, wait the start be completed
        if (promises.start) await promises.start.value;

        if (!this.#id) throw new Error('Listener not started');

        try {
            ipc.events.off('watchers', `listener:${this.#id}.change`, this.#change);
            await ipc.exec('watchers', 'listeners.delete', {watcher: watcher.id, id: this.#id});
            this.#id = undefined;
        }
        catch (exc) {
            promises.stop.reject(exc);
            throw exc;
        }
        finally {
            delete promises.stop;
        }
    }

    destroy() {
        if (this.#destroyed) {
            console.warn(`FS listener "${this.#path}" already destroyed`);
            return;
        }
        this.#destroyed = true;

        this.emit('destroyed');
        this.removeAllListeners();
        if (!this.#id) return;
        this.stop().catch(exc => console.log(exc.stack));
    }
}
