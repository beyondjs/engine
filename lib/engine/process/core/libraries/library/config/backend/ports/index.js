const instance = global.dashboard ? 'dashboard' : 'main';

module.exports = new class {
    #ports = new Map();

    get(pkg) {
        const key = `${pkg}/legacy/${instance}`;

        if (this.#ports.has(key)) return this.#ports.get(key);
        const port = new (require('./port'))(pkg);
        this.#ports.set(key, port);
        return port;
    }
}
