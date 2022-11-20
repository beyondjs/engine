const SourceMap = require('../../sourcemap');

module.exports = function (targetedExport) {
    const sourcemap = new SourceMap();

    targetedExport.processors.forEach(processor => {
        if (!processor.css?.outputs.styles) return;
        const {styles} = processor.css.outputs;

        sourcemap.concat(styles.code, void 0, styles.map);
        sourcemap.concat('\n');
    });

    const {code, map} = sourcemap;
    return {code, map};
}
