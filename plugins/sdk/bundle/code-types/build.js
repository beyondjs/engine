const SourceMap = require('../../sourcemap');

module.exports = async function (targetedExport) {
    const sourcemap = new SourceMap();

    targetedExport.processors.forEach(({types}) => {
        if (!types?.outputs.ims?.size) return;
        const {ims} = types.outputs;
console.log('types ims', ims);
        // sourcemap.concat(styles.code, void 0, styles.map);
        // sourcemap.concat('\n');
    });

    const {code, map} = sourcemap;
    return {code, map};

    // let code = '';
    // const compiler = this.compiler;
    // code += require('./modules')(compiler);
    // code += require('./exports')(compiler);
    // return code;
}
