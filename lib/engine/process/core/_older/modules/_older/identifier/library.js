module.exports = class {
    get is() {
        return 'library-module-identifier';
    }

    #library;
    get library() {
        return this.#library;
    }

    #module;
    get module() {
        return this.#module;
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    constructor(library, module, bundle) {
        this.#library = library;
        this.#module = module;
        this.#bundle = bundle;
    }
}