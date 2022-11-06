const ts = require('typescript');
const {Diagnostic} = require('beyond/plugins/sdk');
const mformat = require('beyond/mformat');

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

    const {code, map, errors} = (() => {
        let code = transpiled.outputText;
        const map = JSON.parse(transpiled.sourceMapText);
        if (!code) return {};

        // Remove the line breaks at the end of the content
        code = code.replace(/\n$/g, '');

        // Remove the sourcemap reference to the source file left by typescript
        code = code.replace(/\/\/([#@])\s(sourceURL|sourceMappingURL)=\s*(\S*?)\s*$/m, '');

        // Transform to CJS
        const cjs = mformat({code, map, format: 'cjs'});
        if (cjs.errors?.length) return {errors: [{message: cjs.errors, kind: 'html'}]};
        return {code: cjs.code, map: cjs.map};
    })();

    // Set the diagnostics data if exists
    const diagnostics = [];
    transpiled.diagnostics?.forEach(diagnostic => diagnostics.push(new Diagnostic(diagnostic)));

    return {code, map, diagnostics};
}
