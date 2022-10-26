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
     * Get a set of processors for the required platform
     *
     * @param platform {string}
     * @param typecheck {boolean}
     */
    get(platform, typecheck) {
        typecheck = !!typecheck;
        const key = `${platform}/${typecheck}`;
        if (this.#psets.has(key)) return this.#psets.get(key);

        const pset = new PSet(this.#bundle, platform, typecheck);
        this.#psets.set(key, pset);
        return pset;
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
