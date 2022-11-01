const PSet = require('./pset');

/**
 * Sets of processors
 */
module.exports = class {
    #conditional;
    #psets = new Map();

    constructor(conditional) {
        this.#conditional = conditional;
    }

    get(typecheck) {
        typecheck = !!typecheck;
        if (this.#psets.has(typecheck)) return this.#psets.get(typecheck);

        const pset = new PSet(this.#conditional, typecheck);
        this.#psets.set(typecheck, pset);
        return pset;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#psets.forEach(pset => pset.destroy());
    }
}
