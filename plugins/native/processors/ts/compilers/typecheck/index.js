const {ProcessorCompiler} = require('beyond/plugins/sdk');
const executeProgram = require('./program');

module.exports = class extends ProcessorCompiler {
    get hash() {
        return this.processor.hash;
    }

    #previous;
    get previous() {
        return this.#previous;
    }

    async _compile(request) {
        const {previous, buildInfo, ims, diagnostics} = await executeProgram(this, request);
        if (this.cancelled(request)) return;

        this.#previous = previous;

        return {ims, diagnostics};
    }
}
