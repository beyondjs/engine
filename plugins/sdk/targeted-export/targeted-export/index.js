const PackageExport = require('../../plugin/package-exports/package-export');

module.exports = class {
    #packageExport;
    get packageExport() {
        return this.#packageExport;
    }

    #id;
    get id() {
        return this.#id;
    }

    get plugin() {
        return this.#packageExport.plugin;
    }

    get pkg() {
        return this.#packageExport.plugin.module.pkg;
    }

    get watcher() {
        return this.plugin.module.pkg.watcher;
    }

    get subpath() {
        return this.#packageExport.subpath;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    constructor(packageExport, platform) {
        if (!(packageExport instanceof PackageExport) || typeof platform !== 'string') {
            throw new Error('Invalid parameters');
        }

        this.#packageExport = packageExport;
        this.#platform = platform;
        this.#id = `${this.#packageExport.id}//${this.#platform}`;
    }

    #destroyed;

    destroy() {
        if (this.#destroyed) throw new Error('Targeted export is already destroyed');
        this.#destroyed = true;
    }
}
