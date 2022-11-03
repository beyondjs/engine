const {ProcessorCompiler} = require('beyond/plugins/sdk');
const Outputs = require('./outputs');

module.exports = class extends ProcessorCompiler {
    get hash() {
        return this.processor.hash;
    }

    _build() {
        return new Outputs();
    }
}
