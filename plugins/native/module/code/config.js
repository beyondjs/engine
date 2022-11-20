const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {processors: registry} = require('beyond/plugins/registry');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundle.code.config';
    }

    #config;

    #value;
    get value() {
        return this.#value;
    }

    constructor(bundle) {
        super();
        this.#config = bundle.packageExport.config;
    }

    _process() {
        const {value: original} = this.#config;

        // Properties of the configuration that are reserved, and are not configuration of the processors
        const reserved = ['imports', 'platforms',  'subpath', 'path'];
        const value = {};
        reserved.forEach(property => original.hasOwnProperty(property) && (value[property] = original[property]));
        value.processors = new Map(
            Object.entries(original)
                .filter(([key]) => !reserved.includes(key) && registry.has(key))
        );
        this.#value = value;
    }
}
