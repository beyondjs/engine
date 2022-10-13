module.exports = new class {
    #cache = new Map();
    #times = [];
    #EXPIRATION = 1000000000;

    constructor() {
        setInterval(this.#clean, 1000);
    }

    #clean = () => {
        if (!this.#times.length) return;

        const expired = Date.now() - this.#EXPIRATION;
        let rq = this.#times[0];
        if (rq.time > expired) return;

        // Expire item
        this.#times.shift();
        this.#cache.delete(rq.key);
    }

    insert(socketId, id, value) {
        const key = `${socketId}.${id}`;
        if (this.#cache.has(key)) {
            console.error(`Cache key "${key}" already set`);
            this.update(socketId, id, value);
            return;
        }

        this.#cache.set(key, value);
        this.#times.push({key, time: Date.now()});
    }

    update(socketId, id, value) {
        const key = `${socketId}.${id}`;
        if (!this.#cache.has(key)) console.warn(`Cache key "${key}" not set`);
        this.#cache.set(key, value);
    }

    has(socketId, id) {
        const key = `${socketId}.${id}`;
        return this.#cache.has(key);
    }

    get(socketId, id) {
        const key = `${socketId}.${id}`;
        return this.#cache.get(key);
    }
}
