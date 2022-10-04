module.exports = class extends (require('./index')) {
    get dp() {
        return 'processor.extender.compiler.singly';
    }

    async _compileSource(source, extended, request) {
        void (source);
        void (extended);
        void (request);
    }

    async #compile(source, updated, diagnostics, request) {
        const extended = this.extendedCompilers;

        const {compiled, errors} = await this._compileSource(source, extended, request);
        if (this._request !== request) return;

        errors && diagnostics.set(source.relative.file, errors);

        compiled && updated.forEach((files, extended) => {
            compiled.has(extended) && files.set(source.relative.file, compiled.get(extended));
        });
    }

    async _compile(updated, diagnostics, request) {
        const {sources} = this.processor;
        for (const source of sources.files.values()) {
            await this.#compile(source, updated, diagnostics, request);
        }
    }
}
