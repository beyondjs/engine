module.exports = class extends require('../../../source') {
    #content;
    get content() {
        return this.#content;
    }

    #map;
    get map() {
        return this.#map;
    }

    #hashes;
    get hashes() {
        return this.#hashes;
    }

    constructor(distribution, source, data) {
        super(void 0, distribution, source.is, source);
        this.#content = data.code;
        this.#map = data.map;
        this.#hashes = new (require('./hashes'))(source, data.code);
    }
}
