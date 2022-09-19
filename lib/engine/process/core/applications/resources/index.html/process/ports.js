const {ipc} = global.utils;
const {dashboard} = global;
const instance = dashboard ? 'dashboard' : 'main';

module.exports = new class {
    #ports = new Map();

    async get(id) {
        if (this.#ports.has(id)) return await this.#ports.get(id).value;
        const promise = Promise.pending();
        this.#ports.set(id, promise);

        const data = await ipc.exec('main', 'bees/data', id, instance);
        const port = data?.ports?.http;
        promise.resolve(port);
        return port;
    }
}
