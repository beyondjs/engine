const {File} = require('beyond/utils/finder');
const {Diagnostic} = require('../../diagnostics/diagnostic');
const crc32 = require('beyond/utils/crc32');
const {sep} = require('path');
const mformat = require('beyond/mformat');

class NamespaceJS extends File {
    #code;
    get code() {
        return this.#code;
    }

    #map;
    get map() {
        return this.#map;
    }

    #cjs;
    get cjs() {
        if (this.#cjs) return this.#cjs;

        // Transform IM to CJS
        const cjs = mformat({code: this.#code, map: this.#map, format: 'cjs'});
        if (cjs.errors?.length) return {errors: [{message: cjs.errors, kind: 'html'}]};
        const {code, map} = cjs;
        return this.#cjs = {code, map};
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
        file && this.#set({file, code, map, diagnostics, hash});
    }

    toJSON() {
        const file = super.toJSON();
        const {code, map, diagnostics, hash} = this;
        return Object.assign({file, code, map, diagnostics, hash});
    }

    #set(data) {
        super.hydrate(data.file);

        this.#specifier = NamespaceJS.specifier(this);
        this.#code = data.code;
        this.#map = data.map;
        this.#hash = data.hash;

        this.#diagnostics = data.diagnostics.map(data => {
            const diagnostic = new Diagnostic();
            diagnostic.hydrate(data);
            return diagnostic;
        });
    }

    hydrate(cached) {
        this.#set(cached);
    }
}

module.exports = NamespaceJS;
