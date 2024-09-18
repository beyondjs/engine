module.exports = class Registry {
    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #processors;
    get processors() {
        return this.#processors;
    }

    constructor(config) {
        this.#bundles = new (require('./bundles'))(config.bundles);
        this.#processors = new (require('./processors'))(config.processors);
    }
}
