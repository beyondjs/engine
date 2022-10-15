const fetch = require('node-fetch');

module.exports = class {
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
        this.#name = name;
        this.#cache = cache;
    }

    async fetch() {
        if (this.#fetching) return;

        this.#fetching = true;
        this._invalidate();

        const response = await fetch(`https://registry.npmjs.org/${this.#name}`);
        if (!response.ok) {
            this.#fetching = false;
            this.#fetched = false;
            this.#error = response.status;
            return;
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
        finally {
            this.#fetching = false;
        }
    }
}
