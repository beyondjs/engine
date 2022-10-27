const {header} = require('beyond/utils/code');
const {ProcessorCompiler, SourceMap} = require('beyond/plugins/helpers');

/**
 * The jsx compiler
 */
module.exports = class extends ProcessorCompiler {
    get dp() {
        return 'jsx.compiler';
    }

    #sourcemap;
    get sourcemap() {
        return this.#sourcemap;
    }

    _compile(updated, diagnostics) {
        const files = this.children.get('files').child;

        const sourcemap = new SourceMap();
        files.forEach(source => {
            const {file} = source.relative;
            sourcemap.concat(header(file));
            sourcemap.concat(source.content, source.url);
        });

        const compiled = require('./compile')(sourcemap);
        compiled.errors?.forEach(error => diagnostics.general.push(error));

        this.#sourcemap = {code: compiled.code, map: compiled.map};
    }

    hydrate(cached) {
        super.hydrate(cached);
        this.#sourcemap = cached.sourcemap;
    }

    toJSON() {
        return Object.assign({sourcemap: this.#sourcemap}, super.toJSON());
    }
}
