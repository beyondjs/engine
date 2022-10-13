const {EventEmitter} = require('events');

module.exports = class extends EventEmitter {
    #bundle;
    #packagers = new Map();

    constructor(bundle) {
        super();
        this.#bundle = bundle;
    }

    get(cspecs, language) {
        language = language ? language : '.';
        const key = `${cspecs.key()}//${language}`;
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        const {Packager} = this.#bundle.meta.bundle;
        const packager = new Packager(this.#bundle, cspecs, language);
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
