const {createHost} = require('./host');
const Outputs = require('./outputs');
const ts = require('typescript');

module.exports = async function (compiler, request) {
    const {files, tsconfig} = compiler.processor.sources;
    await files.ready;
    if (compiler.cancelled(request)) return;

    const promises = [];
    files.forEach(file => promises.push(file.ready));
    promises.push(tsconfig.ready);
    await Promise.all(promises);
    if (compiler.cancelled(request)) return;

    const rootNames = (() => {
        const extensions = []; // [...this.#sources.extensions.keys()].map(file => `${file}.ts`);
        return [...files.keys(), ...extensions];
    })();

    const {host, emitted, cachedModules} = (() => {
        if (!compiler.previous) return createHost(compiler);

        const {host, emitted, cachedModules} = compiler.previous;
        return {host, emitted, cachedModules};
    })();

    const options = tsconfig.content;
    const program = compiler.previous ?
        ts.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, options, host, compiler.previous?.program) :
        ts.createIncrementalProgram({rootNames, options, host});

    let diagnostics = [
        ...program.getConfigFileParsingDiagnostics(),
        ...program.getSyntacticDiagnostics(),
        ...program.getOptionsDiagnostics(),
        ...program.getSemanticDiagnostics()
    ];

    const result = program.emit();
    diagnostics = result.diagnostics.concat(diagnostics);
    const outputs = new Outputs(compiler, diagnostics, emitted);

    // Return the tsBuildInfo to be saved into cache
    // If the compiler does not generate changes, because there was no change in processing,
    // then the tsBuildInfoFile will be undefined.
    const buildInfo = (() => {
        const file = [...emitted].find(([file]) => file.endsWith('tsconfig.tsbuildinfo'));
        return file?.[1];
    })();

    const previous = {program, host, emitted, buildInfo, cachedModules};
    return {previous};
}
