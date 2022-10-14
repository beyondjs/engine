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

    constructor(packager) {
        super();
        this.#packager = packager;
        this.#cache = new PackagerCodeCache(this);
    }
}
