const header = require('./header');
const {sep} = require('path');

module.exports = function (conditional, transversal, hmr, sourcemap) {
    function processIM(im) {
        const {hash, code, map, specifier} = (() => {
            const {hash, code, map, extname} = im;
            const {file} = im.relative;
            const normalized = sep === '/' ? file : file.replace(/\\/g, `/`);

            const resource = normalized.slice(0, normalized.length - extname.length);
            const specifier = `./${resource}`;
            return {hash, code, map, specifier};
        })();

        sourcemap.concat(header(`INTERNAL MODULE: ${specifier}`));

        const creator = 'creator: function (require, exports) {';

        sourcemap.concat(`ims.set('${specifier}', {hash: ${hash}, ${creator}`);
        sourcemap.concat(code, specifier, map);
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
    conditional.processors.forEach(({js}) => js?.outputs.ims?.forEach(im => processIM(im)));
}
