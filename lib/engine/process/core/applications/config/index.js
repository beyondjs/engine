module.exports = class {
    #project;
    #packagers = new Map();

    constructor(project) {
        this.#project = project;
    }

    get(distribution) {
        if (this.#packagers.has(distribution.key)) return this.#packagers.get(distribution.key);

        const packager = new (require('./packager'))(this.#project, distribution);
        this.#packagers.set(distribution.key, packager);
        return packager;
    }
}
