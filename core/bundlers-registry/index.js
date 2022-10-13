module.exports = new class {
    #initialised = false;

    #bundles;
    get bundles() {
        return this.#bundles;
    }

    #processors;
    get processors() {
        return this.#processors;
    }

    initialise(config) {
        if (this.#initialised) throw new Error('Bundler registries already initialised');
        this.#initialised = true;

        this.#bundles = new (require('./bundles'))(config.bundles);
        this.#processors = new (require('./processors'))(config.processors);
    }
}
