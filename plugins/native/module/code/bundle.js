const {Conditional, ProcessorsSet} = require('beyond/plugins/sdk');
const Config = require('./config');
const JS = require('./js');

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
        this.#js = new JS(this);
    }
}
