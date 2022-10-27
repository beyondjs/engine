const {crc32} = global.utils;

module.exports = class extends global.ProcessorSource {
    #content;
    get content() {
        return this.#content;
    }

    #map;
    get map() {
        return this.#map;
    }

    #hash;
    get hash() {
        if (this.#hash !== undefined) return this.#hash;
        return this.#hash = crc32(this.#content);
    }

    #original;
    get original() {
        return this.#original;
    }

    constructor(is, source, content, map) {
        super(void 0, is, source);
        this.#content = content;
        this.#map = map;
        this.#original = {hash: source.hash};
    }

    hydrate(cached) {
        super.hydrate(cached);
        this.#original = cached.original;
    }

    toJSON() {
        return Object.assign({original: this.#original}, super.toJSON());
    }
}
