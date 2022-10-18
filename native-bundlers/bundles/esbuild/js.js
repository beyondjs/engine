const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'esbuild.js';
    }

    #builder;

    get extname() {
        return '.js';
    }

    get errors() {
        return this.#builder.errors;
    }

    get valid() {
        return this.#builder.valid;
    }

    code(hmr) {
        if (hmr) throw new Error(`This packager doesn't support HMR`);
        return this.#builder.code;
    }

    map(hmr) {
        if (hmr) throw new Error(`This packager doesn't support HMR`);
        return this.#builder.map;
    }

    constructor(packager, builder) {
        super();
        this.#packager = packager;
        this.#builder = builder;
    }
}
