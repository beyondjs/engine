const DynamicProcessor = require('beyond/utils/dynamic-processor');
const {processors: registry} = require('beyond/plugins/registry');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'targeted-export.code.config';
    }

    #targetedExport;
    #config;

    #value;
    get value() {
        return this.#value;
    }

    constructor(targetedExport) {
        super();
        this.#targetedExport = targetedExport;
        this.#config = targetedExport.packageExport.config;
    }

    _process() {
        const {value: original} = this.#config;

        // Properties of the configuration that are reserved, and are not configuration of the processors
        const reserved = ['imports', 'platforms', 'subpath', 'path'];
        const value = {};
        reserved.forEach(property => original.hasOwnProperty(property) && (value[property] = original[property]));
        value.processors = new Map(
            Object.entries(original)
                .filter(([key]) => !reserved.includes(key) && registry.has(key))
        );
        this.#value = value;
    }
}
