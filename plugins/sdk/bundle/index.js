const Conditional = require('../plugin/conditional');
const Processors = require('./processors');

module.exports = class extends Conditional {
    #psets;
    get psets() {
        return this.#psets;
    }

    #diagnostics;
    get diagnostics() {
        return this.#diagnostics;
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
    }
}
