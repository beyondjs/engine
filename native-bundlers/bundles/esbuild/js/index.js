const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {PackagerCodeCache} = require('beyond/cache');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'esbuild.js';
    }

    #packager;
    get packager() {
        return this.#packager;
    }

    get id() {
        return this.#packager.id;
    }

    get extname() {
        return '.js';
    }

    #cache;

    #errors = [];
    get errors() {
        return this.#errors;
    }

    get valid() {
        return !this.#errors.length;
    }

    #code;
    #map;

    code(hmr) {
        if (hmr) throw new Error(`This packager doesn't support HMR`);
        return this.#code;
    }

    map(hmr) {
        if (hmr) throw new Error(`This packager doesn't support HMR`);
        return this.#map;
    }

    constructor(packager) {
        super();
        this.#packager = packager;
        this.#cache = new PackagerCodeCache(this);
    }

    async _begin() {

    }

    hydrate(cached) {

    }

    toJSON() {

    }
}
