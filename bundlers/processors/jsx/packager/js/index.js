const {ProcessorCode} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorCode {
    _build() {
        const {sourcemap} = this.compiler;
        return {code: sourcemap};
    }
}
