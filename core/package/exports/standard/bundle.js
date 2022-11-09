const DynamicProcessor = require('beyond/utils/dynamic-processor');
const JS = require('./js');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.standard-export.bundle';
    }

    #pexport;
    get pexport() {
        return this.#pexport;
    }

    get pkg() {
        return this.#pexport.pkg;
    }

    #platform;
    get platform() {
        return this.#platform;
    }

    #entry;
    get entry() {
        return this.#entry;
    }

    #js;
    get js() {
        return this.#js;
    }

    constructor(pexport, platform, entry) {
        super();
        this.#pexport = pexport;
        this.#platform = platform;
        this.#entry = entry;

        this.#js = new JS(this);
    }
}
