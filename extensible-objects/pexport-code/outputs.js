const Resource = require('./resource');
const {ConditionalCodeCache} = require('beyond/stores');

module.exports = class {
    #cache;
    #loaded = false;

    #resources = new Map();

    #hash;
    get hash() {
        return this.#hash;
    }

    #code;
    #build;

    get id() {
        return this.#code.id;
    }

    get updated() {
        return this.#code.hash === this.#hash;
    }

    constructor(code, build, specs) {
        this.#code = code;
        this.#build = build;

        const {cache} = specs;
        cache && (this.#cache = new ConditionalCodeCache(this));
    }

    get ready() {
        return this.#code.preprocessor?.ready || this.#code.ready;
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
    }

    get(hmr) {
        if (this.#resources.has(hmr)) return this.#resources.get(hmr);

        const values = this.#build(hmr);
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
        return this.#resources.has(void 0) ? this.#resources.get(void 0).toJSON() : void 0;
    }
}
