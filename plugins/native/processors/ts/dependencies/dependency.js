module.exports = class {
    #specifier;
    get specifier() {
        return this.#specifier;
    }

    #is = new Set();
    get is() {
        return this.#is;
    }

    #sources = [];
    get sources() {
        return this.#sources;
    }

    constructor(specifier) {
        this.#specifier = specifier;
    }
}