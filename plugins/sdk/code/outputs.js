const {GeneratedCodeCache} = require('beyond/stores');
const Resource = require('./resource');

module.exports = class {
    #cache;
    #loaded = false;

    #resources = new Map();

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

    get(hmr) {
        if (this.#resources.has(hmr)) return this.#resources.get(hmr);

        const values = this.#generate(hmr);
        if (typeof values !== 'object') throw new Error('Invalid returned data from outputs generation');

        const resource = new Resource(values);
        this.#resources.set(hmr, resource);

        if (hmr) {
            /**
             * The HMR request should be requested immediately, it does not need to be kept in memory for a long time
             */
            setTimeout(() => this.#resources.delete(hmr), 10000);
        }
        else {
            /**
             * If it is not an HMR resource, save to cache
             */
            this.#cache.save();
        }

        return resource;
    }

    clear() {
        this.#resources.clear();
        this.#cache?.delete();
    }

    hydrate(cached) {
        const resource = new Resource(cached);
        this.#resources.set(void 0, resource);
    }

    toJSON() {
        return this.#values.has(void 0) ? this.#values.get(void 0).toJSON() : void 0;
    }
}
