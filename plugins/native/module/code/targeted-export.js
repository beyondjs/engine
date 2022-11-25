const {TargetedExport, ProcessorsSet, BundleJS, BundleCSS, BundleTypes} = require('beyond/plugins/sdk');
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

    #js;
    get js() {
        return this.#js;
    }

    #types;
    get types() {
        return this.#types;
    }

    #css;
    get css() {
        return this.#css;
    }

    constructor(...params) {
        super(...params);

        this.#config = new Config(this);
        this.#processors = new ProcessorsSet(this);
        this.#js = new BundleJS(this);
        this.#types = new BundleTypes(this);
        this.#css = new BundleCSS(this);
    }
}
