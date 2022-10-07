const {EventEmitter} = require('events');
const PackagerBase = require('./packager');

module.exports = class extends EventEmitter {
    #bundle;
    #packagers = new Map();

    constructor(bundle) {
        super();
        this.#bundle = bundle;
    }

    get(distribution, language) {
        language = language ? language : '.';
        const key = `${distribution.key}//${language}`;
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        const {meta} = this.#bundle;
        const Packager = meta.bundle?.Packager ? meta.bundle.Packager : PackagerBase;
        const packager = new Packager(this.#bundle, distribution, language);
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
