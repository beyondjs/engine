module.exports = class {
    #project;
    #packagers = new Map();

    constructor(project) {
        this.#project = project;
    }

    get(cspecs, local) {
        local = !!local;
        const key = `${cspecs.key()}/${local}`;
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        const packager = new (require('./packager'))(this.#project, cspecs, local);
        this.#packagers.set(key, packager);
        return packager;
    }
}
