const crc32 = require('beyond/utils/crc32');

class NamespaceTypes {
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

    #hash;
    get hash() {
        return this.#hash;
    }

    #name;
    get name() {
        return this.#name;
    }

    static name(specifier) {
        return `./${specifier}`;
    }

    constructor(values) {
        if (!values) return;

        const hash = crc32(values.code);
        this.#set(Object.assign({hash}, values));
    }

    toJSON() {
        const {specifier, code, map, hash} = this;
        return Object.assign({specifier, code, map, hash});
    }

    #set(data) {
        this.#name = NamespaceTypes.name(this);
        this.#specifier = data.specifier;
        this.#code = data.code;
        this.#map = data.map;
        this.#hash = data.hash;
    }

    hydrate(cached) {
        this.#set(cached);
    }
}

module.exports = NamespaceTypes;
