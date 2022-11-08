const DynamicProcessor = require('beyond/utils/dynamic-processor');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return '';
    }

    #bundle;
    get bundle() {
        return this.#bundle;
    }

    set bundle(value) {
        this.#bundle = value;
    }

    get pexport() {
        return this.#bundle.pexport;
    }

    get js() {
        return this.#bundle.js;
    }
}
