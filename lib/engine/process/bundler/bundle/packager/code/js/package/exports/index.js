/**
 * Process the exports of the bundle
 *
 * @param packager {object} The bundle packager
 * @param hmr {boolean} Is it an hmr bundle?
 * @param bkb {boolean} Is it the @beyond-js/kernel/bundle bundle?
 * @param sourcemap {object} The sourcemap of the processed script
 * @param transversal {boolean} Is it a transversal bundle or not
 */
module.exports = function (packager, hmr, bkb, sourcemap, transversal) {
    const {processors} = packager;

    // scripts.module:
    // Module export processing updates the module's standard interface (esm, amd, cjs).
    let exp = {module: '', descriptor: []};
    const tab = '    ';

    // Add the declaration of all exports (not used on HMR code)
    const declaration = hmr ? void 0 : new Set();

    const process = (processor) => {
        const {packager} = processor;
        if (!packager || !packager.js) return;

        const {ims} = packager.js
        ims?.forEach(im => {
            const {exports, id} = im;
            exports?.forEach(({name, from}) => {
                const require = `require('${id}').${from}`;

                exp.descriptor.push({im: id, from, name});

                // Module exports are not used by transversals and HMR
                if (!hmr && !transversal) {
                    const n = name === 'default' ? '_default' : name;

                    declaration.add(n);
                    exp.module += bkb ? `${tab}${n} = ${require};\n` :
                                  `${tab}(require || prop === '${n}') && (${n} = require ? ${require} : value);\n`;
                }
            });
        });
    }
    processors.forEach(processor => process(processor));

    // Set the exports descriptor
    exp.descriptor.length && (
        transversal && !hmr ?
        sourcemap.concat(`exports.descriptor = ${JSON.stringify(exp.descriptor)};\n`) :
        sourcemap.concat(`__pkg.exports.descriptor = ${JSON.stringify(exp.descriptor)};\n`)
    );

    if (!hmr && !transversal) {
        const exports = [...declaration].join(', ');
        declaration.size && sourcemap.concat(`export let ${exports};\n`);
        declaration.has('_default') && sourcemap.concat('export default _default;');

        sourcemap.concat('// Module exports');

        const params = bkb ? 'require' : '{require, prop, value}';
        sourcemap.concat(`__pkg.exports.process = function(${params}) {`);
        sourcemap.concat(exp.module);
        sourcemap.concat('};');
    }

    !hmr && !transversal && require('./beyond')(packager, sourcemap);
}
