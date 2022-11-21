const SourceMap = require('../../sourcemap');

module.exports = function (targetedExport) {
    const sourcemap = new SourceMap();

    let count = 0;
    targetedExport.processors.forEach(({css}) => {
        if (!css?.outputs.styles) return;
        const {styles} = css.outputs;

        if (styles.code === void 0) return;
        count++;
        sourcemap.concat(styles.code, void 0, styles.map);
        sourcemap.concat('\n');
    });

    if (!count) return;

    const {code, map} = sourcemap;
    return {code, map};
}
