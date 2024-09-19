const {crc32} = global.utils;

module.exports = class {
    #source;
    #code;

    get root() {
        return this.#source.hash;
    }

    #preprocessed;
    get preprocessed() {
        if (this.#preprocessed !== void 0) return this.#preprocessed;
        return this.#preprocessed = crc32(this.#code);
    }

    constructor(source, code) {
        this.#source = source;
        this.#code = code;
    }
}
