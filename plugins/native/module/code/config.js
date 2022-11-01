const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {processors: registry} = require('beyond/plugins/registry');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundle.config';
    }

    #config;

    #value;
    get value() {
        return this.#value;
    }

    constructor(bundle) {
        super();
        this.#config = bundle.pexport.config;
    }

    _process() {
        const {value: original} = this.#config;

        // Properties of the configuration that are reserved, and are not configuration of the processors
        const reserved = ['imports', 'multilanguage', 'subpath'];
        const value = {};
        value.processors = new Map(
            Object.entries(original)
                .filter(([key]) => !reserved.includes(key) && registry.has(key))
        );
        this.#value = value;
    }
}
