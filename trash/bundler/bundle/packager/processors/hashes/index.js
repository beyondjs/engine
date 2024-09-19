module.exports = class {
    #inputs;
    get inputs() {
        return this.#inputs;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    constructor(processors) {
        this.#inputs = new (require('./inputs'))(processors);
        this.#dependencies = new (require('./dependencies'))(processors);
    }
}
