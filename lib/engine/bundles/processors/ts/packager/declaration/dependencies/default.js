module.exports = class {
    #name;
    get name() {
        return this.#name;
    }

    #consumers = new Set();
    get consumers() {
        return this.#consumers;
    }

    constructor(id) {
        this.#name = `__beyond_dep_def_${id}`;
    }
}
