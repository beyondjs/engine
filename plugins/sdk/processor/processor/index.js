const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    #bundle;

    constructor(bundle) {
        super();
        this.#bundle = bundle;
    }

    configure(config) {

    }
}
