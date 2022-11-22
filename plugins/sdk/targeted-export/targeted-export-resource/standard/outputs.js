const Resource = require('./resource');
const {TargetedExportResourceCache} = require('beyond/stores');

module.exports = class {
    #cache;
    #loaded = false;

    #resources = new Map();

    #hash;
    get hash() {
        return this.#hash;
    }

    #code;

    /**
     * The function that resides in the PackageExportCode that builds the bundle
     */
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
        cache && (this.#cache = new TargetedExportResourceCache(this));
    }

    get ready() {
        return this.#code.preprocessor?.ready || this.#code.ready;
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
    }

    async build(hmr) {
        if (this.#resources.has(hmr)) return this.#resources.get(hmr);

        const build = await this.#build(hmr);
        if (build && typeof build !== 'object') throw new Error('Invalid returned data from outputs generation');

        const resource = new Resource({code: build?.code, map: build?.map, diagnostics: build?.diagnostics});
        this.#resources.set(hmr, resource);

        if (hmr) {
            /**
             * The HMR request should be requested immediately, it does not need to be kept in memory for a long time
             */
            setTimeout(() => this.#resources.delete(hmr), 5000);
        }
        else {
            /**
             * If it is not an HMR resource, save to cache
             */
            this.#cache?.save();
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
