const {GeneratedCodeCache} = require('beyond/stores');

module.exports = class extends Map {
    #cache;

    #code;
    #generate;
    #hashes;

    /**
     * Not HMR values for code, map, errors, warnings
     */
    #values;

    constructor(code, generate, hashes, specs) {
        super();
        this.#code = code;
        this.#generate = generate;
        this.#hashes = hashes;

        const {cache} = specs;
        cache && (this.#cache = new GeneratedCodeCache(this));
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
    }
}
