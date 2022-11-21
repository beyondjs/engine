const {ProcessorCode, Diagnostics, ProcessorStylesOutput} = require('beyond/plugins/sdk');

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
        const styles = new ProcessorStylesOutput({code: `#body: {color: 'blue'}`});
        return {diagnostics, styles};
    }
}
