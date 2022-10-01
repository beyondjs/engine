module.exports = class extends global.ProcessorSource {
    #compiled;
    get compiled() {
        return this.#compiled;
    }

    /**
     * Compiler source constructor
     *
     * @param processor {object} The processor object
     * @param is {string} Can be 'source' or 'overwrite'
     * @param source {object} Optional. If not specified, the source will be hydrated
     * @param compiled {any} Optional. If not specified, the compiled information be hydrated
     */
    constructor(processor, is, source, compiled) {
        super(processor, is, source);
        this.#compiled = compiled;
    }

    hydrate(cached) {
        super.hydrate(cached);
        this.#compiled = cached.compiled;
    }

    toJSON() {
        const json = {compiled: this.#compiled};
        return Object.assign(json, super.toJSON());
    }
}
