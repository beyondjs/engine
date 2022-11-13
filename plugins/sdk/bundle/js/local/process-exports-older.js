const tab = '    ';

module.exports = function (conditional, transversal, hmr, sourcemap) {
    const {processors} = conditional;

    // scripts.module:
    // Module export processing updates the module's standard interface (esm, amd, cjs).
    let exp = {module: '', descriptor: []};

    // Add the declaration of all exports (not used on HMR code)
    const declaration = hmr ? void 0 : new Set();

    processors.forEach(processor => {
        if (!processor.js?.exports) return;

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
    });

    // Set the exports descriptor
    exp.descriptor.length && (transversal && !hmr ?
        sourcemap.concat(`exports.descriptor = ${JSON.stringify(exp.descriptor)};\n`) :
        sourcemap.concat(`__pkg.exports.descriptor = ${JSON.stringify(exp.descriptor)};\n`));

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

    /**
     * Injects the code to activate hmr support
     */
    const excludes = [
        '@beyond-js/kernel/bundle',
        '@beyond-js/kernel/routing',
        '@beyond-js/bee/main'
    ];
    if (excludes.includes(packager.bundle.specifier)) return;

    sourcemap.concat('export const hmr = new (function () {\n' +
        '    this.on = (event, listener) => __pkg.hmr.on(event, listener);\n' +
        '    this.off = (event, listener) => __pkg.hmr.off(event, listener);\n' +
        '});\n\n');
}
