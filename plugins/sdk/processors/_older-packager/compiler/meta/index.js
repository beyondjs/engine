/**
 * Meta is no longer used. Should be removed.
 */
module.exports = class {
    #files = new Map();
    get files() {
        return this.#files;
    }

    #extensions = new Map();
    get extensions() {
        return this.#extensions;
    }

    // Set and hydrate as two different methods just because the interface could change in the future
    hydrate(cached) {
        this.#files = new Map(cached.files);
        this.#extensions = new Map(cached.extensions);
    }

    toJSON() {
        return {files: [...this.files], extensions: [...this.extensions]};
    }
}
