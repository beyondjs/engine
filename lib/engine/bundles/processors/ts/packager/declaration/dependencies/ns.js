module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #consumers = new Set();
    get consumers() {
        return this.#consumers;
    }

    #names = new Set();
    get names() {
        return this.#names;
    }

    constructor(id) {
        this.#name = `__beyond_dep_ns_${id}`;
    }
}
