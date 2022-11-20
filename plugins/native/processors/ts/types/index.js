const {Diagnostics, ProcessorCode} = require('beyond/plugins/sdk');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'types';
    }

    get hash() {
        return this.processor.hash;
    }

    async _build(request) {
        const compiler = this.processor.compilers.get('typecheck');
        await compiler.outputs.ready;
        if (this.cancelled(request)) return;

        const diagnostics = new Diagnostics();
        const ims = compiler.outputs.data;
        return {diagnostics, ims};
    }
}
