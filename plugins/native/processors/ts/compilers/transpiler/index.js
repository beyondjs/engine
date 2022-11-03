const {ProcessorCompiler} = require('beyond/plugins/sdk');
const Outputs = require('./outputs');

module.exports = class extends ProcessorCompiler {
    get hash() {
        return this.processor.hash;
    }

    async _compile() {
        const {sources} = this.processor;
        await sources.files.ready;

        return new Outputs();
    }
}
