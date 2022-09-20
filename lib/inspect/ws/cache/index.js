module.exports = class {
    #cache = require('./cache');
    #socketId;

    constructor(socketId) {
        this.#socketId = socketId;
    }

    insert(key, value) {
        return this.#cache.insert(this.#socketId, key, value);
    }

    update(key, value) {
        return this.#cache.update(this.#socketId, key, value);
    }

    has(key) {
        return this.#cache.has(this.#socketId, key);
    }

    get(key) {
        return this.#cache.get(this.#socketId, key);
    }
}