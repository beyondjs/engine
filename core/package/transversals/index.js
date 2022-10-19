const {bundles} = require('beyond/bundlers-registry');

module.exports = class {
    #pkg;
    #transversals = new Map();

    constructor(pkg) {
        this.#pkg = pkg;
    }

    get(name) {
        if (this.#transversals.has(name)) return this.#transversals.get(name);

        if (!bundles.has(name)) throw new Error(`Bundle "${name}" not found`);
        if (!bundles.get(name).transversal) throw new Error(`Bundle "${name}" is not a transversal bundle`);
        const {transversal} = bundles.get(name);

        const bundle = new transversal.Transversal(this.#pkg, name);
        this.#transversals.set(name, bundle);
        return bundle;
    }

    has(name) {
        if (!bundles.has(name)) return false;
        return !!bundles.get(name).transversal;
    }
}
