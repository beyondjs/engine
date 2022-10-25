module.exports = class {
    #bundle;
    #packagers = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    get(platform, language) {
        const key = platform + (language ? `/${language}` : '');
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        const {meta} = this.#bundle;
        const Packager = meta.bundle?.Css ? meta.bundle.Css : require('../../code/css');
        const packager = meta.extname.includes('.css') ? new Packager(this) : void 0;

        this.#packagers.set(key, packager);
        return packager;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #clear = () => {
        this.#packagers.forEach(packager => packager.destroy());
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#clear();
    }
}
