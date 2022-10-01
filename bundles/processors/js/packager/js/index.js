module.exports = class extends global.ProcessorCode {
    _build() {
        const {files} = this;
        const sourcemap = new global.SourceMap();

        const {header} = global.utils.code;
        sourcemap.concat(header('JS PROCESSOR'));

        files.forEach(source => {
            let {file} = source.relative;
            sourcemap.concat(header(`FILE: ${file}`));
            sourcemap.concat(source.content, source.url);
        });

        return {code: sourcemap};
    }
}
