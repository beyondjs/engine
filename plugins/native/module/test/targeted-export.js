const {TargetedExport} = require('beyond/plugins/sdk');
const JS = require('./js');

module.exports = class extends TargetedExport {
    #js;
    get js() {
        return this.#js;
    }

    constructor(...params) {
        super(...params);
        this.#js = new JS(this);
    }
}
