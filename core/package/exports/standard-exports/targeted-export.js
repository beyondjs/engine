const DynamicProcessor = require('beyond/utils/dynamic-processor');
const JS = require('./js');

module.exports = class extends DynamicProcessor() {
    get dp() {
        return 'package.standard-export.targeted-export';
    }

    #packageExport;
    get packageExport() {
        return this.#packageExport;
    }

    get pkg() {
        return this.#packageExport.pkg;
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

    constructor(packageExport, platform, entry) {
        super();
        this.#packageExport = packageExport;
        this.#platform = platform;
        this.#entry = entry;

        this.#js = new JS(this);
    }
}
