const {ProcessorCode, Diagnostics} = require('beyond/plugins/sdk');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'js';
    }

    get hash() {
        return this.processor.hash;
    }

    async _build(request) {
        const compiler = this.processor.compilers.get('default');
        await compiler.outputs.ready;
        if (this.cancelled(request)) return;

        const ims = compiler.outputs.data;
        const diagnostics = new Diagnostics();
        return {diagnostics, ims};
    }
}
