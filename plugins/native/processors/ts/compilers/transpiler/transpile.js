const ts = require('typescript');
const {Diagnostic} = require('beyond/plugins/sdk');

/**
 * Transpile a ts source into javascript code
 *
 * @param source
 * @param tsconfig
 * @return {{code?: string, map?: *, diagnostics: Diagnostic[]}}
 */
module.exports = function (source, tsconfig) {
    let transpiled;
    try {
        transpiled = ts.transpileModule(source.content, {
            compilerOptions: tsconfig.content.compilerOptions,
            fileName: source.file,
            reportDiagnostics: true
        });
    }
    catch (exc) {
        const diagnostic = new Diagnostic(source, exc.message);
        const diagnostics = [diagnostic];
        return {diagnostics};
    }

    const code = (() => {
        const code = transpiled.outputText;

        // Remove the sourcemap reference to the source file left by typescript
        return code.replace(/\/\/([#@])\s(sourceURL|sourceMappingURL)=\s*(\S*?)\s*$/m, '');
    })();
    const map = transpiled.sourceMapText;

    // Set the diagnostics data if exists
    const diagnostics = [];
    transpiled.diagnostics?.forEach(diagnostic => diagnostics.push(new Diagnostic(diagnostic)));

    return {code, map, diagnostics};
}
