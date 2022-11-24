const {createHost} = require('./host');
const Diagnostics = require('./diagnostics');
const InternalModules = require('./ims');
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
        const rootNames = [];
        files.forEach(file => rootNames.push(file.file));
        // extensions.forEach(file => `${file.file}.ts`);
        return rootNames;
    })();

    const {host, emitted, cachedModules} = (() => {
        if (!compiler.previous) return createHost(compiler);

        const {host, emitted, cachedModules} = compiler.previous;
        return {host, emitted, cachedModules};
    })();

    const options = (() => {
        const compilerOptions = tsconfig.content?.compilerOptions ?? {};
        return Object.assign({}, compilerOptions, {
            emitDeclarationOnly: true,
            declarationMap: true,
            incremental: true,
            moduleResolution: ts.ModuleResolutionKind.NodeJs,
            inlineSources: false
        });
    })();

    const program = compiler.previous ?
        ts.createEmitAndSemanticDiagnosticsBuilderProgram(rootNames, options, host, compiler.previous?.program) :
        ts.createIncrementalProgram({rootNames, options, host});

    const diagnostics = (() => {
        let diagnostics = [
            ...program.getConfigFileParsingDiagnostics(),
            ...program.getSyntacticDiagnostics(),
            ...program.getOptionsDiagnostics(),
            ...program.getSemanticDiagnostics()
        ];

        const result = program.emit();
        diagnostics = result.diagnostics.concat(diagnostics);

        return new Diagnostics(diagnostics);
    })();

    const ims = diagnostics.valid ? new InternalModules(compiler.processor, emitted) : void 0;

    // Return the tsBuildInfo to be saved into cache
    // If the compiler does not generate changes, because there was no change in processing,
    // then the tsBuildInfoFile will be undefined.
    const buildInfo = (() => {
        const file = [...emitted].find(([file]) => file.endsWith('tsconfig.tsbuildinfo'));
        return file?.[1];
    })();

    const previous = {program, host, buildInfo, cachedModules};
    return {previous, diagnostics, ims};
}