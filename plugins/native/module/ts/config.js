const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'bundle.ts.config';
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
        const reserved = ['imports', 'platforms', 'subpath', 'path'];
        const value = {}, ts = {};
        reserved.forEach(property => original.hasOwnProperty(property) ?
            (value[property] = original[property]) :
            (ts[property] = original[property])
        );

        value.processors = new Map([['ts', ts]]);
        this.#value = value;
    }
}
