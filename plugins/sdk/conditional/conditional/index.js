const PExport = require('../../plugin/exports/export');

module.exports = class {
    #pexport;
    get pexport() {
        return this.#pexport;
    }

    #id;
    get id() {
        return this.#id;
    }

    get plugin() {
        return this.#pexport.plugin;
    }

    get watcher() {
        return this.plugin.module.pkg.watcher;
    }

    get subpath() {
        return this.#pexport.subpath;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    constructor(pexport, platform) {
        if (!(pexport instanceof PExport) || typeof platform !== 'string') throw new Error('Invalid parameters');

        this.#pexport = pexport;
        this.#platform = platform;
        this.#id = `${this.#pexport.id}//${this.#platform}`;
    }

    #destroyed;

    destroy() {
        if (this.#destroyed) throw new Error('Conditional is already destroyed');
        this.#destroyed = true;
    }
}
