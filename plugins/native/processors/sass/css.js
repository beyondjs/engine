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
            const diagnostic = new Diagnostic({
                kind: 'error',
                file: file.file,
                message: {text: exc.sassMessage},
                start: {
                    line: exc.span.start.line,
                    column: exc.span.start.column
                },
                end: {
                    line: exc.span.end.line,
                    column: exc.span.end.column
                }
            });
            return {diagnostic};
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
            const {code, map, diagnostic} = this._compileFile(file);
            diagnostic && diagnostics.push(diagnostic);
            diagnostics.valid && sourcemap.concat(code, null, map);
        });

        const {code, map} = sourcemap;
        const styles = diagnostics.valid ? new ProcessorStylesOutput({code, map}) : void 0;
        return {diagnostics, styles};
    }
}
