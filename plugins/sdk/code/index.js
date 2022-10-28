const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {CodeCache} = require('beyond/stores');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'code';
    }

    #conditional;
    get conditional() {
        return this.#conditional;
    }

    #code = new Map();
    #map = new Map();

    async code(key) {
        return this.#code.get(key);
    }

    async map(key) {
        return this.#map.get(key);
    }

    #cache;
    #hash;
    get hash() {
        return this.#hash;
    }

    #processor;

    /**
     * Code constructor
     *
     * @param conditional {*}
     * @param cache {boolean} Cache enabled or not
     */
    constructor(conditional, cache) {
        super();
        this.#conditional = conditional;
        cache && (this.#cache = new CodeCache(this));
    }

    async _begin() {
        const cached = await this.#cache?.load();
        cached && this.hydrate(cached);
        await this.#conditional.ready;
    }

    /**
     * Expected to be overridden
     * @return {boolean}
     */
    get updated() {
        return true;
    }

    async _update() {
        throw new Error('This method must be overridden');
    }

    _process() {
        if (this.updated) return;

    }

    hydrate(cached) {
        const {hash, code, map, errors} = cached;
        this.#hash = hash;
        this.#code = new Map(code);
        this.#map = new Map(map);
        this.#errors = errors;
    }

    toJSON() {
        const hash = this.#hash;
        const code = [...this.#code];
        const map = [...this.#map];
        const errors = this.#errors;
        return {hash, code, map, errors}
    }
}
