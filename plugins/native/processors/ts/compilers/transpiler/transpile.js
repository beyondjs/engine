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
    const compilerOptions = (() => {
        const compilerOptions = tsconfig.content?.compilerOptions ?? {};
        return Object.assign({}, compilerOptions, {
            module: ts.ModuleKind.ESNext,
            target: ts.ScriptTarget.ESNext,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            sourceMap: true,
            inlineSources: false,
            // noEmitOnError: true
        });
    })();

    let transpiled;
    try {
        transpiled = ts.transpileModule(source.content, {
            fileName: source.file,
            reportDiagnostics: true,
            compilerOptions
        });
    }
    catch (exc) {
        const diagnostic = new Diagnostic(source, exc.message);
        const diagnostics = [diagnostic];
        return {diagnostics};
    }

    const {code, map} = (() => {
        let code = transpiled.outputText;
        const map = JSON.parse(transpiled.sourceMapText);
        if (!code) return {};

        // Remove the line breaks at the end of the content
        code = code.replace(/\n$/g, '');

        // Remove the sourcemap reference to the source file left by typescript
        code = code.replace(/\/\/([#@])\s(sourceURL|sourceMappingURL)=\s*(\S*?)\s*$/m, '');

        return {code, map};
    })();

    // Set the diagnostics data if exists
    const diagnostics = [];
    transpiled.diagnostics?.forEach(diagnostic => diagnostics.push(new Diagnostic(diagnostic)));

    return {code, map, diagnostics};
}
