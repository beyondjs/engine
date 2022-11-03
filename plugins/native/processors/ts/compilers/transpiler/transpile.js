module.exports = function (source, tsconfig) {
    // Process the source
    const ovalue = {
        compilerOptions: tsconfig.compilerOptions,
        fileName: source.relative.file,
        reportDiagnostics: true
    };

    const {processor, cspecs} = this.packager;

    // Transpile the code of the source file
    let transpiled;
    try {
        const {content} = source;
        transpiled = ts.transpileModule(content, ovalue);
    }
    catch (exc) {
        const compiled = new this.#CompiledSource(processor, cspecs, is, source, {});
        const errors = [exc.message];
        return {compiled, errors};
    }

    const code = transpiled.outputText;
    const map = transpiled.sourceMapText;

    // Set the diagnostics data if exists
    const errors = [];
    transpiled.diagnostics?.forEach(diagnostic => errors.push(new Diagnostic(diagnostic)));

    const compiled = new this.#CompiledSource(processor, cspecs, is, source, {code, map});
    return {compiled, errors};
}
