const {GeneratedCodeCache} = require('beyond/stores');
const Resource = require('./resource');

module.exports = class {
    #cache;
    #loaded = false;

    #ims = new Map();
    #script;

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
        return this.#code.preprocessor?.ready || this.#code.ready;
    }

    async load() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        this.#loaded = !!cached;
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
