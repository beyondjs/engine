const {GeneratedCodeCache} = require('beyond/stores');

module.exports = class extends Map {
    #cache;
    #loaded = false;

    /**
     * Not HMR values for code, map, errors, warnings
     */
    #values;

    #hash;
    get hash() {
        return this.#hash;
    }

    #code;
    #generate;

    get id() {
        return this.#code.id;
    }

    get updated() {
        return this.#code.hash === this.#hash;
    }

    constructor(code, generate, specs) {
        super();
        this.#code = code;
        this.#generate = generate;

        const {cache} = specs;
        cache && (this.#cache = new GeneratedCodeCache(this));
    }

    get ready() {
        return this.#code.preprocessor?.ready;
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
    }

    obtain(resource, hmr) {
        if (!['code', 'map', 'errors', 'warnings'].includes(resource)) throw new Error('Invalid parameters');

        if (!hmr && this.#values) return this.#values[resource];
        if (hmr && this.has(hmr)) return this.get(hmr)[resource];

        const values = this.#generate(hmr);
        if (typeof values !== 'object') throw new Error('Invalid returned data from outputs generation');

        const {code, map, errors, warnings} = values;

        if (hmr) {
            this.set(hmr, {code, map, errors, warnings});

            /**
             * The HMR request should be requested immediately, it does not need to be kept in memory for a long time
             */
            setTimeout(() => this.delete(hmr), 10000);
        }
        else {
            this.#values = values;
            this.#cache.save();
        }

        return values[resource];
    }

    clear() {
        super.clear();
        this.#values = void 0;
        this.#cache?.delete();
    }

    hydrate(cached) {
        const {code, map} = cached;
        this.#values = {code, map};
    }

    toJSON() {
        return this.#values;
    }
}
