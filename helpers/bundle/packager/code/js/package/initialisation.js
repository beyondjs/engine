/**
 * Package initialisation
 *
 * @param packager {object} The packager
 * @param hmr {boolean} Is it an hmr bundle?
 * @return {string|undefined} The initialisation code
 */
module.exports = function (packager, hmr) {
    const {bundle} = packager;
    const transversal = !!global.bundles.get(bundle.type).transversal;

    if (!hmr && transversal) {
        const imports = [...packager.dependencies.code.keys()]
            .filter(specifier => specifier !== '@beyond-js/kernel/bundle')
            .map(specifier => `'${specifier}'`);

        if (!imports.length) return '';

        const dependencies = `dependencies: [${imports.join(',')}]`;
        return `return {${dependencies}};`;
    }

    // When the bundle is a transversal, the package initialization is made by the transversal in
    // the bundle creator function
    return `__pkg.${hmr ? 'update' : 'initialise'}(ims);`;
}
