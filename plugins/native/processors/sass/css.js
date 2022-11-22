const {ProcessorCode, Diagnostics, Diagnostic, ProcessorStylesOutput, SourceMap} = require('beyond/plugins/sdk');
const sass = require('sass');

module.exports = class extends ProcessorCode {
    get resource() {
        return 'css';
    }

    get hash() {
        return this.processor.hash;
    }

    constructor(...params) {
        super(...params);
    }

    _prepared(require) {
        const {files} = this.processor.sources;
        require(files) && files.forEach(file => require(file));
    }

    _compileFile(file) {
        let result;
        try {
            const options = {sourceMap: true};
            result = sass.compileString(file.content, options);
        }
        catch (exc) {
            const errors = [{message: exc.message}];
            return {errors};
        }

        const {css, sourceMap: map} = result;
        const code = css.toString();
        map.sources[0] = file.relative.file;
        return {code, map};
    }

    _build() {
        const sourcemap = new SourceMap();
        const diagnostics = new Diagnostics();

        const {files} = this.processor.sources;
        files.forEach(file => {
            const {code, map, errors} = this._compileFile(file);
            sourcemap.concat(code, null, map);
        });

        const {code, map} = sourcemap;
        const styles = new ProcessorStylesOutput({code, map});
        return {diagnostics, styles};
    }
}
