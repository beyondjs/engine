const {ipc} = global.utils;
const DynamicProcessor = global.utils.DynamicProcessor();

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

        const data = await ipc.exec('main', 'launchers/data', this.#key);
        this.#value = data?.ports?.http;
    }
}
