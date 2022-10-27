module.exports = class {
    #pexport;
    get pexport() {
        return this.#pexport;
    }

    get plugin() {
        return this.#pexport.plugin;
    }

    get subpath() {
        return this.#pexport.subpath;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    constructor(pexport, platform) {
        this.#pexport = pexport;
        this.#platform = platform;
    }
}
