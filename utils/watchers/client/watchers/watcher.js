const PendingPromise = require('beyond/utils/pending-promise');
const ipc = require('beyond/utils/ipc');
const ChainedException = require('./chained-exception');

module.exports = class {
    #id;
    get id() {
        return this.#id;
    }

    get started() {
        return !!this.#id;
    }

    #promises = {};
    #listeners = new (require('./listeners'))(this);
    get listeners() {
        return this.#listeners;
    }

    get starting() {
        return !!this.#promises.start;
    }

    get stopping() {
        return !!this.#promises.stop;
    }

    #container;
    get container() {
        return this.#container;
    }

    constructor(container) {
        this.#container = container;
    }

    async start() {
        if (this.#id) return; // Watcher already started

        const promises = this.#promises;
        if (promises.start) return await promises.start;
        const promise = new PendingPromise();
        promises.start = promise;

        if (promises.stop) await promises.stop;

        const error = new Error('Error starting watcher');
        try {
            const promise = ipc.exec('watchers', 'create', {container: this.#container});
            this.#id = await promise;
            promises.start.resolve(this.#id);
        }
        catch (exc) {
            promises.start.reject(new ChainedException(error, exc));
        }
        finally {
            delete promises.start;
        }

        return await promise;
    }

    async stop() {
        if (!this.#id) return; // Watcher already stopped

        // If stopping the watcher when it is already starting, wait the start be completed
        const promises = this.#promises;
        if (promises.start) await promises.start;

        if (promises.stop) return await promises.stop;
        promises.stop = new PendingPromise();

        const error = new Error('Error stopping watcher');
        try {
            await this.#listeners.destroy();
            await ipc.exec('watchers', 'delete', {id: this.#id});
            this.#id = undefined;
            promises.stop.resolve();
        }
        catch (exc) {
            exc = new ChainedException(error, exc);
            promises.stop.reject(exc);
            throw exc;
        }
        finally {
            delete promises.stop;
        }
    }
}
