/**
 * Injects the code to activate hmr support
 *
 * @param packager {object} The bundle packager
 * @param sourcemap {object} The object with the sourcemap information
 */
module.exports = function (packager, sourcemap) {
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
