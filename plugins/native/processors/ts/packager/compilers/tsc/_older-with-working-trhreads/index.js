const workers = require('./workers');

module.exports = class extends global.ProcessorCompiler {
    get dp() {
        return 'ts.compiler';
    }

    get is() {
        return 'tsc';
    }

    #CompiledSource = require('../source');
    get CompiledSource() {
        return this.#CompiledSource;
    }

    #tsBuildInfo;
    get tsBuildInfo() {
        return this.#tsBuildInfo;
    }

    constructor(packager) {
        super(packager);
        this.waitToProcess = 300;  // Wait 300ms before processing after invalidation
        this.notifyOnFirst = true; // Notify a 'change' event when the first process is completed
    }

    async _compile(updated, diagnostics, request) {
        const {processor} = this.packager;
        const {specs, dependencies, analyzer, options, tsBuildInfo} = this;
        const {path} = specs.bundle;

        const compilation = await workers.process(path, dependencies, analyzer, options.value, tsBuildInfo);
        if (this._request !== request) return;

        this.#tsBuildInfo = compilation.tsBuildInfo;

        diagnostics.set(compilation.diagnostics);
        if (!diagnostics.valid) return;

        const process = (is, singular) => analyzer[is].forEach(source => {
            const {file} = source.relative;
            if (!compilation.files.has(source.file)) {
                diagnostics.files.set(file, [{message: 'Compiled code has not been emitted or not found'}]);
                return;
            }

            const emitted = compilation.files.get(source.file);
            const compiled = new this.#CompiledSource(processor, singular, source, emitted);
            updated[is].set(file, compiled);
        });

        process('files', 'source');
        process('extensions', 'extension');
    }

    hydrate(cached) {
        this.#tsBuildInfo = cached.data.tsBuildInfo;
        super.hydrate(cached);
    }

    toJSON() {
        const json = super.toJSON();
        json.tsBuildInfo = this.#tsBuildInfo;
        return json;
    }
}
