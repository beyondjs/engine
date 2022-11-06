const SourceMap = require('../../sourcemap');
const Imports = require('./imports');
const bundleCreation = require('./bundle-creation');
const processScripts = require('./process-scripts')
const processIMs = require('./process-ims')

module.exports = function (conditional, hmr) {
    const {processors, plugin} = conditional;
    const {transversal} = plugin;
    const imports = new Imports(processors);
    const sourcemap = new SourceMap();

    /**
     * The imports
     */
    imports.code && sourcemap.concat(imports.code);

    /**
     * The creation of the bundle object that controls the execution in development environment
     */
    bundleCreation(conditional, hmr, imports, sourcemap);

    /**
     * Process the scripts exposed by the processors
     */
    processScripts(conditional, sourcemap);

    /**
     * Process the internal modules exposed by the processors
     */
    processIMs(conditional, transversal, hmr, sourcemap);

    /**
     * Only required for .jsx legacy processor support
     */
    if (processors.has('jsx')) {
        sourcemap.concat(`const React = ${imports.get('react').variable};`);
        sourcemap.concat(`const ReactDOM = ${imports.get('react-dom').variable};`);
    }

    const {code, map} = sourcemap;
    return {code, map};
}
