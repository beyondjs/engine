module.exports = class {
    #general;
    get general() {
        this.#general = this.#general ? this.#general : [];
        return this.#general;
    }

    #warnings;
    get warnings() {
        this.#warnings = this.#warnings ? this.#warnings : [];
        return this.#warnings;
    }

    #files;
    get files() {
        this.#files = this.#files ? this.#files : new Map();
        return this.#files;
    }

    #dependencies;
    get dependencies() {
        this.#dependencies = this.#dependencies ? this.#dependencies : new Map();
        return this.#dependencies;
    }

    get valid() {
        const general = this.#general;
        const files = this.#files;
        const dependencies = this.#dependencies;

        const invalid = general?.length || files?.size || dependencies?.size;
        return !invalid;
    }

    constructor(data) {
        // To verify that there is no legacy code that should be removed
        if (data) throw new Error('Invalid parameters');
    }

    // Set and hydrate as two different methods just because the interface could change in the future
    hydrate(cached) {
        this.set(cached);
    }

    // This method is used by the tsc compiler
    set(data) {
        this.#general = data.general;
        this.#files = new Map(data.files);
        this.#dependencies = new Map(data.dependencies);
    }

    toJSON() {
        return {
            general: this.general,
            files: [...this.files],
            dependencies: [...this.dependencies]
        };
    }
}
