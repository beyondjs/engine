const tab = '    ';

module.exports = function (conditional, transversal, hmr, sourcemap) {
    const {processors, pexport} = conditional;
    const bkb = pexport.specifier.value === '@beyond-js/kernel/bundle';

    // scripts.module:
    // Module export processing updates the module's standard interface (esm, amd, cjs).
    let exp = {module: '', descriptor: []};

    // Add the declaration of all exports (not used on HMR code)
    const declaration = hmr ? void 0 : new Set();

    let counter = 0;
    processors.forEach(({js}) => js?.exports?.forEach(bundleExport => {
        const {imSpecifier, name, from} = bundleExport;
        const require = `require('${imSpecifier}').${from}`;
        exp.descriptor.push({im: imSpecifier, from, name});

        // Module exports are not used by transversals and HMR
        if (!hmr && !transversal) {
            const n = name === 'default' ? '_default' : name;

            declaration.add(n);
            exp.module = counter++ ? '\n' : '';
            exp.module += bkb ? `${tab}${n} = ${require};` :
                `${tab}(require || prop === '${n}') && (${n} = require ? ${require} : value);`;
        }
    }));

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
    (() => {
        const excludes = [
            '@beyond-js/kernel/bundle',
            '@beyond-js/kernel/routing',
            '@beyond-js/bee/main'
        ];
        const specifier = conditional.pexport.specifier.value;
        if (excludes.includes(specifier)) return;

        sourcemap.concat('export const hmr = new (function () {\n' +
            '    this.on = (event, listener) => __pkg.hmr.on(event, listener);\n' +
            '    this.off = (event, listener) => __pkg.hmr.off(event, listener);\n' +
            '});\n\n');
    })();
}
