module.exports = new class {
    #ports = new Map();

    get(pkg) {
        const key = `${pkg}/legacy`;

        if (this.#ports.has(key)) return this.#ports.get(key);
        const port = new (require('./port'))(pkg);
        this.#ports.set(key, port);
        return port;
    }
}
