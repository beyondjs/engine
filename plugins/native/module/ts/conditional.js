const {Conditional, ProcessorsSet, BundleJsCode} = require('beyond/plugins/sdk');
const Config = require('./config');

module.exports = class extends Conditional {
    #processors;
    get processors() {
        return this.#processors;
    }

    #config;
    get config() {
        return this.#config;
    }

    #js;
    get js() {
        return this.#js;
    }

    constructor(...params) {
        super(...params);
        this.#config = new Config(this);
        this.#processors = new ProcessorsSet(this);
        this.#js = new BundleJsCode(this);
    }
}
