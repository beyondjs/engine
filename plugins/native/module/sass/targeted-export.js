const {TargetedExport, ProcessorsSet, BundleCSS} = require('beyond/plugins/sdk');
const Config = require('./config');

module.exports = class extends TargetedExport {
    #processors;
    get processors() {
        return this.#processors;
    }

    #config;
    get config() {
        return this.#config;
    }

    #css;
    get css() {
        return this.#css;
    }

    constructor(...params) {
        super(...params);
        this.#config = new Config(this);
        this.#processors = new ProcessorsSet(this);
        this.#css = new BundleCSS(this);
    }
}
