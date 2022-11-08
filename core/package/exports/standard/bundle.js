const DynamicProcessor = require('beyond/utils/dynamic-processor');
const JS = require('./js');

module.exports = class extends DynamicProcessor() {
    #pexport;
    get pexport() {
        return this.#pexport;
    }

    #condition;
    #entry;

    #js;
    get js() {
        return this.#js;
    }

    constructor(pexport, condition, entry) {
        super();
        this.#pexport = pexport;
        this.#condition = condition;
        this.#entry = entry;

        this.#js = new JS(this);
    }
}
