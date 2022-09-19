module.exports = function (bundle) {
    const transversal = global.bundles.get(bundle.type).Transversal;
    if (transversal) return '';

    const excludes = [
        '@beyond-js/kernel/bundle',
        '@beyond-js/kernel/routing',
        '@beyond-js/bee/main'
    ];
    if (excludes.includes(bundle.specifier)) return '';

    // Add HMR instance to the bundle's declaration
    return 'export declare const hmr: {' +
        'on: (event: string, listener: any) => void, ' +
        'off: (event: string, listener: any) => void ' +
        '};';
}
