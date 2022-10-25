const {bundles} = require('beyond/bundlers-registry');

module.exports = function (bundle, sourcemap) {
    const transversal = bundles.get(bundle.type).Transversal;
    if (transversal) return;

    const excludes = [
        '@beyond-js/kernel/bundle',
        '@beyond-js/kernel/routing',
        '@beyond-js/bee/main'
    ];
    if (excludes.includes(bundle.specifier)) return;

    // Add HMR instance to the bundle's declaration
    sourcemap.concat('export declare const hmr: {' +
        'on: (event: string, listener: any) => void, ' +
        'off: (event: string, listener: any) => void ' +
        '};');
}
