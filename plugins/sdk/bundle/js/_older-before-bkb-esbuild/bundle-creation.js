module.exports = function (conditional, hmr, imports, sourcemap) {
    const {pexport} = conditional;
    const specifier = pexport.specifier.value, vspecifier = pexport.specifier.vspecifier;

    /**
     * The bundle '@beyond-js/kernel/bundle'
     */
    if (specifier === '@beyond-js/kernel/bundle') {
        sourcemap.concat('let __bundle = {exports: {}};');
        return;
    }

    /**
     * In transversals, the bundle is created by the transversal itself
     */
    const {transversal} = conditional.plugin;
    if (transversal && !hmr) return;

    /**
     * Create the bundle object
     */
    const bbm = imports.get('@beyond-js/kernel/bundle').variable;

    if (specifier !== '@beyond-js/kernel/bundle' && hmr) {
        /**
         * In HMR, get the bundle instance, as it is already created
         */
        sourcemap.concat(`const {instances} = ${bbm};`);
        sourcemap.concat(`const __bundle = instances.get('${vspecifier}');`);
    }
    else if (specifier !== '@beyond-js/kernel/bundle') {
        /**
         * Create the bundle
         * The name of the var __Bundle (instead of Bundle) is because the ims of the
         * legacy projects (js processor) are not scoped
         */
        sourcemap.concat(`const {Bundle: __Bundle} = ${bbm};`);

        const {type, name} = conditional;
        const specs = {vspecifier, type, name};

        const params = JSON.stringify(specs) + ', import.meta.url';
        sourcemap.concat(`const __bundle = new __Bundle(${params});`);
    }

    /**
     * Register the dependencies of the package
     */
    (() => {
        const register = [...imports.values()]
            .filter(({specifier}) => specifier !== '@beyond-js/kernel/bundle')
            .map(({specifier, variable}) => `['${specifier}', ${variable}]`);

        sourcemap.concat(`\n__bundle.dependencies.update([${register.join(',')}]);\n`);
    })();

    /**
     * Just for legacy projects
     */
    const {engine} = conditional.pkg;
    engine === 'legacy' && sourcemap.concat(`const {module} = __bundle;`);
}
