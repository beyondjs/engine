module.exports = class extends require('../../../source') {
    #errors;
    get errors() {
        return this.#errors ? this.#errors : [];
    }

    get valid() {
        return !this.errors.length;
    }

    #dependencies;
    get dependencies() {
        return this.#dependencies;
    }

    #exports;
    get exports() {
        return this.#exports;
    }

    // The content of the source is overwritten when it is a client bridge
    #content;
    get content() {
        return this.#content;
    }

    /**
     * Analyzer source constructor
     *
     * @param processor {object} The processor object
     * @param distribution {object} The distribution specification
     * @param is {string} Can be 'source', 'overwrite' or 'extension'
     * @param source {object} Optional. If not specified, the source will be hydrated
     * @param data {{dependencies?: object, exports?: object, content?: string, errors?: string[]}} Optional. If not specified, it will be hydrated
     */
    constructor(processor, distribution, is, source, data) {
        super(processor, distribution, is, source);

        this.#errors = data?.errors ? data.errors : [];
        this.#dependencies = data?.dependencies ? data.dependencies : new Map();
        this.#exports = data?.exports ? data.exports : new Map();
        this.#content = data?.content ? data.content : source?.content;
    }

    hydrate(cached) {
        super.hydrate(cached);
        this.#errors = cached.errors;
        this.#dependencies = new Map(cached.dependencies);
        this.#exports = new Set(cached.exports);
        this.#content = cached.content;
    }

    toJSON() {
        const json = {
            errors: this.#errors,
            dependencies: [...this.#dependencies],
            exports: [...this.#exports],
            content: this.#content
        };
        return Object.assign(json, super.toJSON());
    }
}
