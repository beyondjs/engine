module.exports = class {
    #inputs;
    get inputs() {
        return this.#inputs;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    constructor(pset) {
        this.#inputs = new (require('./inputs'))(pset);
        this.#dependencies = new (require('./dependencies'))(pset);
    }
}
