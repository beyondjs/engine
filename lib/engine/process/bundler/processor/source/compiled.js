module.exports = class extends require('./index') {
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

    get css() {
        return this.#compiled.css;
    }

    #cssMap;
    get cssMap() {
        if (this.#cssMap !== void 0) return this.#cssMap;

        let map = this.#compiled.cssMap;
        this.#cssMap = map = typeof map === 'string' ? JSON.parse(map) : map;
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
     * @param compiled? {object} Optional. If not specified, the compiled information be hydrated
     */
    constructor(processor, distribution, is, source, compiled) {
        super(processor, distribution, is, source);
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
