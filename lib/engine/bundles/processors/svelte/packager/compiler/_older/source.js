module.exports = class extends global.ProcessorSource {
    #source;

    get dependencies() {
        return this.#source.dependencies;
    }

    get exports() {
        return this.#source.exports;
    }

    #compiled;
    get compiled() {
        return this.#compiled;
    }

    get code() {
        return this.#compiled.code;
    }

    get map() {
        return this.#compiled.map;
    }

    get declaration() {
        return this.#compiled.declaration;
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
        this.#source = source;
    }
}
