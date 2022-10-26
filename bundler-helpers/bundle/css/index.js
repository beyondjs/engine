const PackagerBase = require('../../bundle-code/css');

module.exports = class {
    #bundle;
    #packagers = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    get(platform) {
        if (this.#packagers.has(platform)) return this.#packagers.get(platform);

        const {meta} = this.#bundle;
        const Packager = meta.bundle?.Css ? meta.bundle.Css : PackagerBase;
        const packager = meta.extname.includes('.css') ? new Packager(this) : void 0;

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
