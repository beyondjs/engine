const PackagerBase = require('../../bundle-code/js');

module.exports = class {
    #bundle;
    #packagers = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    get(platform) {
        if (this.#packagers.has(platform)) return this.#packagers.get(platform);

        const {meta} = this.#bundle;
        const Packager = meta.bundle?.Js ? meta.bundle.Js : PackagerBase;
        const packager = meta.extname.includes('.js') ? new Packager(this) : void 0;

        this.#packagers.set(platform, packager);
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
