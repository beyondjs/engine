const {GeneratedCodeCache} = require('beyond/stores');

module.exports = class extends Map {
    #generate;
    #cache;

    /**
     * Not HMR values for code, map, errors, warnings
     */
    #values;

    constructor(generate, specs) {
        super();
        this.#generate = generate;

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

        if (this.has(hmr)) return this.get(hmr)[resource];

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
}
