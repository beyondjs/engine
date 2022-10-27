const Packager = require('./packager');

module.exports = class {
    #bundle;
    #packagers = new Map();

    constructor(bundle) {
        this.#bundle = bundle;
    }

    get(platform) {
        if (this.#packagers.has(platform)) return this.#packagers.get(platform);

        const packager = new Packager(this.#bundle, platform);
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
