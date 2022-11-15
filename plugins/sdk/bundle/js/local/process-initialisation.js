module.exports = function (conditional, transversal, hmr, sourcemap) {
    if (!hmr && transversal) {
        const imports = [...packager.dependencies.code.keys()]
            .filter(specifier => specifier !== '@beyond-js/kernel/bundle')
            .map(specifier => `'${specifier}'`);

        if (!imports.length) return '';

        const dependencies = `dependencies: [${imports.join(',')}]`;
        sourcemap.concat(`return {${dependencies}};`);
    }
    else {
        // When the bundle is a transversal, the package initialization is made by the transversal in
        // the bundle creator function
        sourcemap.concat(`__bundle.${hmr ? 'update' : 'initialise'}(ims);`);
    }
}
