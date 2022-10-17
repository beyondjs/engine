const DynamicProcessor = require('beyond/utils/dynamic-processor');
const PendingPromise = require('beyond/utils/pending-promise');
const fetch = require('node-fetch');

module.exports = class extends DynamicProcessor() {
    #name;
    #cache;

    #value;
    get value() {
        return this.#value;
    }

    #error;
    get error() {
        return this.#error;
    }

    get valid() {
        return !this.#error;
    }

    #fetching;
    get fetching() {
        return this.#fetching;
    }

    #fetched;
    get fetched() {
        return this.#fetched;
    }

    #time;
    /**
     * Timestamp when the last satisfying fetch was made
     * @return {number}
     */
    get time() {
        return this.#time;
    }

    constructor(name, cache) {
        super();
        this.#name = name;
        this.#cache = cache;
    }

    #promise;

    async fetch() {
        if (this.#promise) return await this.#promise;
        this.#fetching = true;
        this.#promise = new PendingPromise();
        this._invalidate();

        const done = () => {
            this.#fetching = false;
            this.#promise.resolve();
            this._invalidate();
        }

        const response = await fetch(`https://registry.npmjs.org/${this.#name}`);
        if (!response.ok) {
            this.#fetched = false;
            this.#error = response.status;
            return done();
        }

        try {
            this.#value = await response.json();
            this.#cache.save(this.#value);
            this.#fetched = true;
            this.#time = Date.now();
        }
        catch (exc) {
            this.#fetched = false;
            this.#error = exc.message;
        }

        done();
    }
}
