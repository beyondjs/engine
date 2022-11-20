const header = require('./header');

module.exports = function (targetedExport, transversal, local, sourcemap) {
    const {hmr} = local;

    function processIM({hash, cjs, specifier}) {
        sourcemap.concat(header(`INTERNAL MODULE: ${specifier}`));

        const creator = 'creator: function (require, exports) {';

        sourcemap.concat(`ims.set('${specifier}', {hash: ${hash}, ${creator}`);
        sourcemap.concat(cjs.code, specifier, cjs.map);
        sourcemap.concat('}});\n');
    }

    (() => {
        if (transversal && !hmr) return;
        // In transversals, the ims map is received from the creator function
        sourcemap.concat('const ims = new Map();\n');
    })();

    /**
     * Process the IMs
     */
    targetedExport.processors.forEach(({js}) => js?.outputs.ims?.forEach(im => processIM(im)));
}
