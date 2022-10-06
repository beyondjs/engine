const ipc = require('beyond/utils/ipc');
const DynamicProcessor = require('beyond/utils/dynamic-processor');

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

        const data = await ipc.exec('main', 'launchers/data', this.#key);
        this.#value = data?.ports?.http;
    }
}