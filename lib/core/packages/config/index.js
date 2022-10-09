module.exports = class {
    #project;
    #packagers = new Map();

    constructor(project) {
        this.#project = project;
    }

    get(cspecs) {
        const key = cspecs.key();
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        const packager = new (require('./packager'))(this.#project, cspecs);
        this.#packagers.set(key, packager);
        return packager;
    }
}
