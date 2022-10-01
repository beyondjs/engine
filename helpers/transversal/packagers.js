module.exports = class {
    #transversal;
    #packagers = new Map();

    constructor(transversal) {
        this.#transversal = transversal;
    }

    get(distribution, language) {
        language = language ? language : '.';
        const key = `${distribution.key}//${language}`;
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        let {Packager} = global.bundles.get(this.#transversal.name).transversal;
        Packager = Packager ? Packager : require('./packager');
        const packager = new Packager(this.#transversal, distribution, language);

        this.#packagers.set(key, packager);
        return packager;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #clear = () => this.#packagers.forEach(packager => packager.destroy());

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#clear();
    }
}
