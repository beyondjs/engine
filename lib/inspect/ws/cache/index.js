module.exports = class {
    #cache = require('./cache');
    #socketId;

    constructor(socketId) {
        this.#socketId = socketId;
    }

    insert(key, value) {
        this.#cache.insert(this.#socketId, key, value);
    }

    update(key, value) {
        this.#cache.update(this.#socketId, key, value);
    }

    has(key) {
        this.#cache.has(this.#socketId, key);
    }

    get(key) {
        this.#cache.get(this.#socketId, key);
    }
}