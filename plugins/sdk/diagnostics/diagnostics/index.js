/**
 * Diagnostics are used by the analyzer and the compiler
 */
module.exports = class {
    #general;
    get general() {
        this.#general = this.#general ? this.#general : [];
        return this.#general;
    }

    #files;
    get files() {
        this.#files = this.#files ? this.#files : new Map();
        return this.#files;
    }

    #extensions;
    get extensions() {
        this.#extensions = this.#extensions ? this.#extensions : new Map();
        return this.#extensions;
    }

    #dependencies;
    get dependencies() {
        this.#dependencies = this.#dependencies ? this.#dependencies : new Map();
        return this.#dependencies;
    }

    get valid() {
        const general = this.#general;
        const files = this.#files;
        const extensions = this.#extensions;
        const dependencies = this.#dependencies;

        const invalid = general?.length || files?.size || extensions?.size || dependencies?.size;
        return !invalid;
    }

    // Set and hydrate as two different methods just because the interface could change in the future
    hydrate(cached) {
        this.set(cached);
    }

    set(data) {
        this.#general = data.general;
        this.#files = new Map(data.files);
        this.#extensions = new Map(data.extensions);
        this.#dependencies = new Map(data.dependencies);
    }

    toJSON() {
        return {
            general: this.general,
            files: [...this.files],
            extensions: [...this.extensions],
            dependencies: [...this.dependencies]
        };
    }
}
