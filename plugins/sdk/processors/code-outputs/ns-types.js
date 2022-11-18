const {File} = require('beyond/utils/finder');
const crc32 = require('beyond/utils/crc32');

module.exports = class extends File {
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

    constructor(file, code, map) {
        super();
        const hash = crc32(code);
        file && this.#set({file, code, map, hash});
    }

    toJSON() {
        const file = super.toJSON();
        const {code, map, hash} = this;
        return Object.assign({file, code, map, hash});
    }

    #set(data) {
        super.hydrate(data.file);

        this.#code = data.code;
        this.#map = data.map;
        this.#hash = data.hash;
    }

    hydrate(cached) {
        this.#set(cached);
    }
}
