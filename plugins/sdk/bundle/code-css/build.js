const SourceMap = require('../../sourcemap');

module.exports = function (targetedExport) {
    const sourcemap = new SourceMap();

    targetedExport.processors.forEach(({css}) => {
        if (!css?.outputs.styles) return;
        const {styles} = css.outputs;

        if (styles.code === void 0) return;
        sourcemap.concat(styles.code, void 0, styles.map);
        sourcemap.concat('\n');
    });

    const {code, map} = sourcemap;
    return {code, map};
}
