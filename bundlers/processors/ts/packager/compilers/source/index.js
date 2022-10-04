const AnalyzerSource = require('../../../processor/analyzer/source');

module.exports = class extends AnalyzerSource {
    #compiled;
    get compiled() {
        return this.#compiled;
    }

    get code() {
        return this.#compiled.code;
    }

    #map;
    get map() {
        if (this.#map !== void 0) return this.#map;

        let map = this.#compiled.map;
        this.#map = map = typeof map === 'string' ? JSON.parse(map) : map;
        return map;
    }

    get declaration() {
        return this.#compiled.declaration;
    }

    /**
     * Compiler source constructor
     *
     * @param processor {object} The processor object
     * @param distribution {object} The distribution specification
     * @param is {string} Can be 'source' or 'overwrite'
     * @param source {object} Optional. If not specified, the source will be hydrated
     * @param compiled {any} Optional. If not specified, the compiled information be hydrated
     */
    constructor(processor, distribution, is, source, compiled) {
        const _interface = source ? {dependencies: source?.dependencies, exports: source?.exports} : void 0;
        super(processor, distribution, is, source, _interface, source?.bridge, source?.content);

        this.#compiled = compiled;
    }

    update({code, map, declaration}) {
        const compiled = this.#compiled;

        this.#map = map ? void 0 : this.#map;

        compiled.code = code !== void 0 ? code : compiled.code;
        compiled.map = map !== void 0 ? map : compiled.map;
        compiled.declaration = declaration !== void 0 ? declaration : compiled.declaration;
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
