const {Conditional} = require('beyond/plugins/sdk');
const JS = require('./js');

module.exports = class extends Conditional {
    #js;
    get js() {
        return this.#js;
    }

    constructor(...params) {
        super(...params);
        this.#js = new JS(this);
    }
}
