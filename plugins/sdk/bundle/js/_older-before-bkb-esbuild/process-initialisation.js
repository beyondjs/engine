module.exports = function (conditional, transversal, hmr, sourcemap) {
    const {pexport} = conditional;
    const bkb = pexport.specifier.value === '@beyond-js/kernel/bundle';

    if (bkb) {
        sourcemap.concat('const __bp = {};');
        sourcemap.concat(`ims.get('./base/index').creator(() => 0, __bp);`);
        sourcemap.concat('__bundle = new __bp.BeyondPackage(__bundle.exports);');
    }

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
