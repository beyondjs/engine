const DynamicProcessor = global.utils.DynamicProcessor();
const {ipc} = global.utils;
const instance = global.dashboard ? 'dashboard' : 'main';

module.exports = class extends DynamicProcessor {
    get dp() {
        return 'project.config.port';
    }

    #key;

    #value;
    get value() {
        return this.#value;
    }

    constructor(pkg, distribution) {
        super();
        this.#key = `${pkg}/${distribution}`;
    }

    async _begin() {
        await super._begin;

        const data = await ipc.exec('main', 'bees/data', this.#key, instance);
        this.#value = data?.ports?.http;
    }
}
