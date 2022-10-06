const {header} = require('beyond/utils/code');
const {ProcessorCode, SourceMap} = require('beyond/bundler-helpers');

module.exports = class extends ProcessorCode {
    _build() {
        const {files} = this;
        const sourcemap = new SourceMap();

        sourcemap.concat(header('JS PROCESSOR'));

        files.forEach(source => {
            let {file} = source.relative;
            sourcemap.concat(header(`FILE: ${file}`));
            sourcemap.concat(source.content, source.url);
        });

        return {code: sourcemap};
    }
}
