const {Conditional, ProcessorsSets} = require('beyond/plugins/sdk');
const Config = require('./config');
const JS = require('./js');

module.exports = class extends Conditional {
    #processorsSets;
    get processorsSets() {
        return this.#processorsSets;
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
        this.#processorsSets = new ProcessorsSets(this);
        this.#js = new JS(this);
    }
}
