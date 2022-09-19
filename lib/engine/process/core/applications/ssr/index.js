const {ipc} = global.utils;

module.exports = class {
    #application;

    constructor(application) {
        this.#application = application;
    }

    async id(distribution) {
        const {distributions} = this.#application.deployment;
        await distributions.ready;

        const found = [...distributions.values()].find(({name}) => name === distribution.ssr);
        if (!found) return;

        return `${this.#application.id}/${distribution.ssr}`;
    }

    #promises = {data: void 0, ready: void 0};

    async data(distribution) {
        if (this.#promises.data) return await this.#promises.data.value;
        this.#promises.data = Promise.pending();

        const id = await this.id(distribution);
        const data = await ipc.exec('main', 'bees/data', id);

        this.#promises.data.resolve(data);
        return data;
    }

    async port(distribution) {
        const data = await this.data(distribution);
        return data.ports.http;
    }

    async ready(distribution) {
        if (!distribution.ssr) return;

        if (this.#promises.ready) return await this.#promises.ready.value;
        this.#promises.ready = Promise.pending();

        const id = await this.id(distribution);
        const {status} = await this.data(distribution);
        if (status === 'running') {
            this.#promises.ready.resolve();
            return;
        }

        await ipc.exec('main', 'bees/start', id);
        await ipc.exec('main', 'bees/ready', id);
        this.#promises.ready.resolve();
    }
}
