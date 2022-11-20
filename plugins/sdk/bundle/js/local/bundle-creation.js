module.exports = function (targetedExport, local, imports, sourcemap) {
    const {packageExport} = targetedExport;
    const vspecifier = packageExport.specifier.vspecifier;
    const {hmr} = local;

    /**
     * In transversals, the bundle is created by the transversal itself
     */
    const {transversal} = targetedExport.plugin;
    if (transversal && !hmr) return;

    /**
     * Create the bundle object
     */
    const blb = imports.get('@beyond-js/local/bundle').variable;

    if (hmr) {
        /**
         * In HMR, get the bundle instance, as it is already created
         */
        sourcemap.concat(`const {instances} = ${blb};`);
        sourcemap.concat(`const __bundle = instances.get('${vspecifier}');`);
    }
    else {
        /**
         * Create the bundle
         * The name of the var __Bundle (instead of Bundle) is because the ims of the
         * legacy projects (js processor) are not scoped
         */
        sourcemap.concat(`const {Bundle: __Bundle} = ${blb};`);
        const specs = {vspecifier};
        const params = JSON.stringify(specs);
        sourcemap.concat(`const __bundle = new __Bundle(${params});`);
    }

    /**
     * Register the dependencies of the package
     */
    (() => {
        const register = [...imports.values()]
            .filter(({specifier}) => specifier !== '@beyond-js/local/bundle')
            .map(({specifier, variable}) => `['${specifier}', ${variable}]`);

        sourcemap.concat(`\n__bundle.dependencies.update([${register.join(',')}]);\n`);
    })();
}
