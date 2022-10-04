module.exports = class extends require('./index') {
    get Source() {
        return require('./source');
    }

    async _preprocessSource(source, request) {
        void (source);
        void (request);
        throw new Error('This method must be overridden');
    }

    /**
     * Preprocess the sources
     *
     * @param preprocessed {Map<string, Map<string, object>>} A map of sources by the processor being extended
     * @param diagnostics {object} The diagnostics
     * @param request
     * @return {Promise<void>}
     * @private
     */
    async _preprocess(preprocessed, diagnostics, request) {
        const process = async sources => {
            for (const source of sources.values()) {
                const previous = this.preprocessed;

                if (previous?.has(source) && previous?.get(source).hash === source.hash) {
                    preprocessed.overwrite(source, previous.get(source));
                    continue;
                }

                const response = await this._preprocessSource(source, request);
                if (this._request !== request) return;

                if (!response) continue;
                const {errors, extensions} = response;

                if (errors?.length) {
                    const is = source.is === 'source' ? 'files' : (source.is === 'extension' ? 'extensions' : 'overwrites');
                    diagnostics[is].set(source.relative.file, errors);
                    continue;
                }

                preprocessed.set(source, extensions);
            }
        }

        if (this.analyzer) {
            await process(this.analyzer);
        }
        else {
            await process(this.sources.files);
            if (this._request !== request) return;
            this.sources.overwrites && await process(this.sources.overwrites);
        }
    }
}
