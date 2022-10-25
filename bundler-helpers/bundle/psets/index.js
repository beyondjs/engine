const PSet = require('./pset');

/**
 * Sets of processors
 */
module.exports = class {
    #bundle;
    #psets = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    /**
     * Creates a set of processors for the required platform
     *
     * @param platform {string}
     * @param typecheck {boolean}
     * @param language {string}
     */
    create(platform, typecheck, language) {
        return new PSet(this.#bundle, platform, typecheck, language);
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #clear = () => {
        this.#psets.forEach(pset => pset.destroy());
        this.#processors.destroy();
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#clear();
    }
}
