const ts = require('typescript');
const Diagnostic = require('../diagnostic');

module.exports = class extends global.ProcessorSinglyCompiler {
    get dp() {
        return 'ts.compiler.transpiler';
    }

    get is() {
        return 'transpiler';
    }

    #CompiledSource = require('../source');
    get CompiledSource() {
        return this.#CompiledSource;
    }

    _compileSource(source, is) {
        const options = this.children.get('options').child;

        // Process the source
        const ovalue = {
            compilerOptions: options.value,
            fileName: source.relative.file,
            reportDiagnostics: true
        };

        const {processor, distribution} = this.packager;

        // Transpile the code of the source file
        let transpiled;
        try {
            const {content} = source;
            transpiled = ts.transpileModule(content, ovalue);
        }
        catch (exc) {
            const compiled = new this.#CompiledSource(processor, distribution, is, source, {});
            const errors = [exc.message];
            return {compiled, errors};
        }

        const code = transpiled.outputText;
        const map = transpiled.sourceMapText;

        // Set the diagnostics data if exists
        const errors = [];
        transpiled.diagnostics?.forEach(diagnostic => errors.push(new Diagnostic(diagnostic)));

        const compiled = new this.#CompiledSource(processor, distribution, is, source, {code, map});
        return {compiled, errors};
    }
}
