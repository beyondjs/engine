const {File} = require('beyond/utils/finder');
const {Diagnostic} = require('../../diagnostics/diagnostic');
const crc32 = require('beyond/utils/crc32');
const {sep} = require('path');

class ProcessorIMOutput extends File {
    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #hash;
    get hash() {
        return this.#hash;
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
    }

    #specifier;
    get specifier() {
        return this.#specifier;
    }

    static specifier(file) {
        const {relative, extname} = file;
        const normalized = sep === '/' ? relative.file : relative.file.replace(/\\/g, `/`);

        const resource = normalized.slice(0, normalized.length - extname.length);
        return `./${resource}`;
    }

    constructor(file, code, map, diagnostics) {
        super();
        const hash = crc32(code);
        file && this.hydrate({file, code, map, diagnostics, hash});
    }

    toJSON() {
        const file = super.toJSON();
        const {code, map, diagnostics, hash} = this;
        return Object.assign({file, code, map, diagnostics, hash});
    }

    hydrate(cached) {
        super.hydrate(cached.file);

        this.#specifier = ProcessorIMOutput.specifier(this);
        this.#code = cached.code;
        this.#map = cached.map;
        this.#hash = cached.hash;

        this.#diagnostics = cached.diagnostics.map(cached => {
            const diagnostic = new Diagnostic();
            diagnostic.hydrate(cached);
            return diagnostic;
        });
    }
}

module.exports = ProcessorIMOutput;
