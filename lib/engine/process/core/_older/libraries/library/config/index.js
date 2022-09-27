module.exports = class {
    #library;
    #packagers = new Map();

    constructor(library) {
        this.#library = library;
    }

    get(distribution) {
        if (this.#packagers.has(distribution.key)) return this.#packagers.get(distribution.key);
        const packager = new (require('./packager'))(this.#library, distribution);
        this.#packagers.set(distribution.key, packager);
        return packager;
    }
}
