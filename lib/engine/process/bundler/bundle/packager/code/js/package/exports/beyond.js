/**
 * Injects the exports to activate hmr support and the __beyond_pkg
 *
 * @param packager {object} The bundle packager
 * @param sourcemap {object} The object with the sourcemap information
 */
module.exports = function (packager, sourcemap) {
    const {bundle, distribution} = packager;

    const excludes = [
        '@beyond-js/kernel/bundle',
        '@beyond-js/kernel/routing',
        '@beyond-js/bee/main'
    ];
    if (excludes.includes(bundle.specifier)) return;

    sourcemap.concat('export const __beyond_pkg = __pkg;\n');
    if (distribution.local) {
        sourcemap.concat('export const hmr = new (function () {\n' +
            '    this.on = (event, listener) => __pkg.hmr.on(event, listener);\n' +
            '    this.off = (event, listener) => __pkg.hmr.off(event, listener);\n' +
            '});\n\n');
    }
    else {
        sourcemap.concat('export const hmr = new (function () {\n' +
            '    this.on = (event, listener) => void 0;\n' +
            '    this.off = (event, listener) => void 0;\n' +
            '});\n\n');
    }
}
