module.exports = class extends require('./') {
    get dp() {
        return 'processor.analyzer.singly';
    }

    async _analyzeSource(source, request) {
        void (source);
        void (request);
        throw new Error('Method must be overridden');
    }

    async _analyze(updated, diagnostics, request) {
        const process = async (sources, is) => {
            for (const source of sources.values()) {
                const {file} = source;

                const analyzed = await (async () => {
                    if (this[is].has(file) && this[is].get(file).hash === source.hash) {
                        const analyzed = this[is].get(file);
                        updated[is].set(file, analyzed);
                    }

                    return await this._analyzeSource(source, request);
                })();

                if (this._request !== request || !analyzed) return;

                const {errors} = analyzed;
                errors?.length && diagnostics[is].set(source.relative.file, errors);
                updated[is].set(file, analyzed);
            }
        }

        const {files, overwrites, extensions} = this.processor.sources;
        await process(files, 'files');
        await process(extensions, 'extensions');
        overwrites && await process(overwrites, 'overwrites');
    }
}
