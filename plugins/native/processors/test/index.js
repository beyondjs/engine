const {Processor} = require('beyond/plugins/sdk');

module.exports = class extends Processor {
    static get name() {
        return 'test';
    }

    #js;
    get js() {
        return this.#js;
    }

    constructor(bundle, processors) {
        super(bundle, processors);
    }
}