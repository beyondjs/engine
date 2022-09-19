const {ipc} = global.utils;
const {dashboard} = global;

module.exports = class {
    #ports = new Map();

    async get(is, id) {
        const bee = `${is}/${id}`;
        const instance = dashboard ? 'dashboard' : 'main';
        const key = `${instance}/${bee}`;

        if (this.#ports.has(key)) return await this.#ports.get(key).value;
        const promise = Promise.pending();
        this.#ports.set(key, promise);

        const data = await ipc.exec('main', 'bees/data', bee, instance);
        const port = data?.port;
        promise.resolve(port);
        return port;
    }
}
