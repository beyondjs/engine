module.exports = new class {
    #initialised = false;

    #plugins;
    get plugins() {
        return this.#plugins;
    }

    #processors;
    get processors() {
        return this.#processors;
    }

    initialise(config) {
        if (this.#initialised) throw new Error('Plugins registries already initialised');
        this.#initialised = true;

        this.#bundles = new (require('./plugins'))(config.plugins);
        this.#processors = new (require('./processors'))(config.processors);
    }
}
