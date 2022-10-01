module.exports = class extends (require('./index')) {
    get dp() {
        return 'packager.compiler.singly';
    }

    async _compileSource(source, is) {
        void (source);
        void (is);
        throw new Error('This method should be overridden');
    }

    async #compile(is, source, updated, diagnostics, meta, request) {
        const {file} = source.relative;

        let compiled, errors, data;
        if (this[is].has(file) && this[is].get(file).hash === source.hash) {
            compiled = this[is].get(file);
            errors = this.diagnostics[is].get(file);
            data = this.meta[is].get(file);
        }
        else {
            const singular = is === 'files' ? 'source' : (is === 'extensions' ? 'extension' : 'overwrite');
            const csource = await this._compileSource(source, singular, request);
            if (!csource) return;

            ({compiled, errors, data} = csource);
            if (!compiled && !errors) return;
        }

        compiled && updated[is].set(file, compiled);
        errors?.length && diagnostics[is].set(file, errors);
        data && meta[is].set(file, data);
    }

    async _compile(updated, diagnostics, meta, request) {
        const {children} = this;

        let files, extensions, overwrites;
        if (children.has('analyzer')) {
            const analyzer = this.children.get('analyzer').child;
            ({files, extensions, overwrites} = analyzer);
        }
        else {
            files = children.get('files').child;
            extensions = children.get('extensions').child;
            overwrites = children.get('overwrites')?.child;
        }

        const process = async (sources, is) => {
            for (const source of sources.values()) {
                await this.#compile(is, source, updated, diagnostics, meta, request);
                if (this._request !== request) return;
            }
        }

        await process(files, 'files');
        await process(extensions, 'extensions');
        overwrites && await process(overwrites, 'overwrites');
    }
}
