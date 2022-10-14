module.exports = class {
    #project;
    #packagers = new Map();

    constructor(project) {
        this.#project = project;
    }

    get(distribution, local) {
        local = !!local;
        const key = `${distribution.key}.${local}`;
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        const packager = new (require('./packager'))(this.#project, distribution, local);
        this.#packagers.set(key, packager);
        return packager;
    }
}
