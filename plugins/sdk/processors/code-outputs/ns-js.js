const crc32 = require('beyond/utils/crc32');
const {sep, extname} = require('path');
const mformat = require('beyond/mformat');

class NamespaceJS {
    #specifier;
    get specifier() {
        return this.#specifier;
    }

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

    #name;
    get name() {
        return this.#name;
    }

    static name(specifier) {
        const ext = extname(specifier);
        const normalized = sep === '/' ? specifier : specifier.replace(/\\/g, `/`);

        const resource = normalized.slice(0, normalized.length - ext.length);
        return `./${resource}`;
    }

    constructor(values) {
        if (!values) return;

        const hash = crc32(values.code);
        this.#set(Object.assign({hash}, values));
    }

    toJSON() {
        const {specifier, code, map, cjs, hash} = this;
        return Object.assign({specifier, code, map, cjs, hash});
    }

    #set(data) {
        this.#name = NamespaceJS.name(this);
        this.#specifier = data.specifier;
        this.#code = data.code;
        this.#map = data.map;
        this.#hash = data.hash;
        this.#cjs = data.cjs;
    }

    hydrate(cached) {
        this.#set(cached);
    }
}

module.exports = NamespaceJS;
