const {EventEmitter} = require('events');

module.exports = class extends EventEmitter {
    #bundle;
    #packagers = new Map();
    #propagator;

    constructor(bundle) {
        super();
        this.#bundle = bundle;
        this.#propagator = new (require('./propagator'))(this);
    }

    get(distribution, language) {
        language = language ? language : '.';
        const key = `${distribution.key}//${language}`;
        if (this.#packagers.has(key)) return this.#packagers.get(key);

        const {meta} = this.#bundle;
        const Packager = meta.bundle?.Packager ? meta.bundle.Packager : require('./packager');
        const packager = new Packager(this.#bundle, distribution, language);
        this.#propagator.subscribe(packager);
        this.#packagers.set(key, packager);
        return packager;
    }

    #destroyed = false;
    get destroyed() {
        return this.#destroyed;
    }

    #clear = () => {
        this.#packagers.forEach(packager => {
            this.#propagator.unsubscribe(packager);
            packager.destroy();
        });
    }

    destroy() {
        if (this.#destroyed) throw new Error('Object already destroyed');
        this.#destroyed = true;
        this.#clear();
    }
}
