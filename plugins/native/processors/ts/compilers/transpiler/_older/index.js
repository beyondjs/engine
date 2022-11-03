const ts = require('typescript');
const Diagnostic = require('../diagnostic');
const {ProcessorSinglyCompiler} = require('beyond/plugins/helpers');

module.exports = class extends ProcessorSinglyCompiler {
    get dp() {
        return 'ts-compiler-transpiler';
    }

    #CompiledSource = require('../source');
    get CompiledSource() {
        return this.#CompiledSource;
    }

    _compileSource(source, is) {

    }
}
