const Conditional = require('../plugin/conditional');
const PSets = require('./psets');

module.exports = class extends Conditional {
    #psets;

    constructor(...params) {
        super(...params);
        this.#psets = new PSets(this);
    }
}
