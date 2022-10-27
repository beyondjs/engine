const {ProcessorCode} = require('beyond/plugins/helpers');

module.exports = class extends ProcessorCode {
    _build() {
        const {sourcemap} = this.compiler;
        return {code: sourcemap};
    }
}
