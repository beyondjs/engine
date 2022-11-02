const Processors = require('./processors');

/**
 * Sets of processors
 */
module.exports = class {
    #conditional;
    #sets = new Map();

    constructor(conditional) {
        this.#conditional = conditional;
    }

    get(typecheck) {
        typecheck = !!typecheck;
        if (this.#sets.has(typecheck)) return this.#sets.get(typecheck);

        const pset = new Processors(this.#conditional, typecheck);
        this.#sets.set(typecheck, pset);
        return pset;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#sets.forEach(pset => pset.destroy());
    }
}
