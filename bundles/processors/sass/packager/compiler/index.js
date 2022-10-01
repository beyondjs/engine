const sass = require('sass');
const toHtml = new (require('ansi-to-html'));

module.exports = class extends global.ProcessorCompiler {
    get dp() {
        return 'sass.compiler';
    }

    get depfiles() {
        return this.children.get('dependencies.files')?.child;
    }

    constructor(packager) {
        super(packager, require('./children'));
    }

    #compileSource(source) {
        if (source.basename.startsWith('_')) return {};

        const importer = new (require('./importer'))(source, this);
        const {processor, distribution} = this.packager;
        const options = {sourceMap: true, importer};

        let result;
        try {
            result = sass.compileString(source.content, options);
        }
        catch (exc) {
            let message = toHtml.toHtml(exc.message);
            message = message.replace(/\n/g, '<br/>');
            message = `<div style="background: #ddd; color: #333;">${message}</div>`;

            const compiled = new this.CompiledSource(processor, distribution, source.is, source, {});
            const errors = [{message}];
            return {compiled, errors};
        }

        const {css, sourceMap: map} = result;
        const code = css.toString();
        map.sources[0] = source.url;

        const compiled = new this.CompiledSource(processor, distribution, source.is, source, {code, map});
        return {compiled};
    }

    async _compile(updated, diagnostics, meta, request) {
        const analyzer = this.children.get('analyzer').child;
        const {files, extensions, overwrites} = analyzer;

        const process = async (sources, is) => {
            for (const source of sources.values()) {
                const {file} = source.relative;

                let compiled, errors;
                const singular = is === 'files' ? 'source' : (is === 'extensions' ? 'extension' : 'overwrite');
                const csource = await this.#compileSource(source, singular, request);
                if (this._request !== request) return;
                if (!csource) continue;

                ({compiled, errors} = csource);
                if (!compiled && !errors) continue;

                compiled && updated[is].set(file, compiled);
                errors?.length && diagnostics[is].set(file, errors);
            }
        }

        await process(files, 'files');
        await process(extensions, 'extensions');
        overwrites && await process(overwrites, 'overwrites');
    }
}
