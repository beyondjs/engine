module.exports = class {
    #dp;
    get dp() {
        return this.#dp;
    }

    #consumers = new Map();
    get consumers() {
        return this.#consumers;
    }

    #pendings = new (require('./pendings'))(this);
    get pendings() {
        return this.#pendings;
    }
}
