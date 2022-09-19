const instance = global.dashboard ? 'dashboard' : 'main';

module.exports = new class {
    #ports = new Map();

    get(pkg, distribution) {
        const key = `${pkg}/${distribution}/${instance}`;

        if (this.#ports.has(key)) return this.#ports.get(key);
        const port = new (require('./port'))(pkg, distribution);
        this.#ports.set(key, port);
        return port;
    }
}
