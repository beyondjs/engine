const ts = require('typescript');

module.exports = class {
    #compiler;

    // The files and extensions sources with the full path as a key of the maps
    #sources;
    get sources() {
        return this.#sources;
    }

    #host;
    #program;
    #emitted;
    #externals;

    // This property is set by the compiler previous to calling the emit method
    tsBuildInfo;

    constructor(compiler) {
        this.#compiler = compiler;

        const {host, emitted, externals} = require('./host').create(compiler);
        this.#host = host;
        this.#emitted = emitted;
        this.#externals = externals;
    }

    emit(updated, diagnostics) {
        const {analyzer, options} = this.#compiler;

        this.#emitted.clear();
        this.#externals.clear();

        // The files are treated with absolute paths by the compiler, the files and extensions
        // in the analyzer are relative
        this.#sources = {
            files: new Map([...analyzer.files.values()].map(source => [source.file, source])),
            extensions: new Map([...analyzer.extensions.values()].map(source => [source.file, source]))
        }

        const rootNames = (() => {
            const files = [...this.#sources.files.keys()];
            const extensions = [...this.#sources.extensions.keys()].map(file => `${file}.ts`);
            return [...files, ...extensions];
        })();

        const program = this.#program = (() => {
            if (!this.#program) {
                return ts.createIncrementalProgram({rootNames, options: options.value, host: this.#host});
            }
            else {
                return ts.createEmitAndSemanticDiagnosticsBuilderProgram(
                    rootNames, options.value, this.#host, this.#program);
            }
        })();

        let diagnosed = [
            ...program.getConfigFileParsingDiagnostics(),
            ...program.getSyntacticDiagnostics(),
            ...program.getOptionsDiagnostics(),
            ...program.getSemanticDiagnostics()
        ];

        const result = program.emit();
        diagnosed = result.diagnostics.concat(diagnosed);
        require('./apply-compilation')(this.#compiler, this.#sources, updated, diagnostics, this.#emitted, diagnosed);

        // Return the tsBuildInfo to be saved into cache
        // If the compiler does not generate changes, because there was no change in processing,
        // then the tsBuildInfoFile will be undefined.
        const tsBuildInfoFile = [...this.#emitted].find(([file]) => file.endsWith('tsconfig.tsbuildinfo'));
        return tsBuildInfoFile?.[1];
    }
}
