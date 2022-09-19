const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc} = global.utils;
const instance = global.dashboard ? 'dashboard' : 'main';

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'library.config.port';
    }

    #key;

    #value;
    get value() {
        return this.#value;
    }

    constructor(pkg) {
        super();
        this.#key = `${pkg}/legacy`;
    }

    async _begin() {
        await super._begin;

        const data = await ipc.exec('main', 'bees/data', this.#key, instance);
        this.#value = data?.ports?.http;
    }
}
