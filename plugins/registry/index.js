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

        this.#plugins = new (require('./plugins'))(config);
        this.#processors = new (require('./processors'))(config);
    }
}
