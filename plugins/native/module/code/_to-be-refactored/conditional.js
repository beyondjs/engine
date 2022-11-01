const Conditional = require('../plugin/exports/export/conditional');
const PSets = require('./psets');
const JS = require('./js');

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
        this.#js = new JS(this);
    }

    destroy() {
        super.destroy();
        this.#psets.destroy();
        this.#diagnostics.destroy();
        this.#js.destroy();
        this.#types.destroy();
        this.#css.destroy();
    }
}
