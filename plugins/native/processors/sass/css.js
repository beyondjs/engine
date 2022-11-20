const {ProcessorCode, Diagnostics} = require('beyond/plugins/sdk');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return this.processor.hash;
    }

    constructor(...params) {
        super(...params);
    }

    async _build(request) {
        void request;

        const diagnostics = new Diagnostics();
        return {diagnostics, styles: `#body: {color: 'blue'}`};
    }
}
