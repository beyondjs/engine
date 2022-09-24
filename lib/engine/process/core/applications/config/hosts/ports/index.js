module.exports = new class {
    #ports = new Map();

    get(pkg, distribution) {
        const key = `${pkg}/${distribution}`;

        if (this.#ports.has(key)) return this.#ports.get(key);
        const port = new (require('./port'))(pkg, distribution);
        this.#ports.set(key, port);
        return port;
    }
}
