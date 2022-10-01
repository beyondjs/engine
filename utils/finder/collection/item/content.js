const {crc32} = global.utils;

module.exports = class {
    // The content as it is on disk
    #value;
    get value() {
        return this.#value;
    };

    #lines;
    get lines() {
        if (this.#lines !== undefined) return this.#lines;
        this.#lines = this.#value.length - this.#value.replace(/\n/g, '').length + 1;
        return this.#lines;
    }

    set value(value) {
        if (value === this.#value) return;
        this.clean();
        this.#value = value;
    }

    #hash;
    get hash() {
        if (this.#hash !== void 0) return this.#hash;
        this.#hash = crc32(this.#value);
        return this.#hash;
    }

    clean() {
        this.#value = this.#lines = this.#hash = void 0;
    }
}
