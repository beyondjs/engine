const SourceMap = require('../../../sourcemap');
const Imports = require('./imports');
const bundleCreation = require('./bundle-creation');
const processScripts = require('./process-scripts')
const processIMs = require('./process-ims')
const processExports = require('./process-exports');

module.exports = function (targetedExport, local) {
    const {processors, plugin} = targetedExport;
    const {transversal} = plugin;
    const imports = new Imports(processors);
    const sourcemap = new SourceMap();

    /**
     * The code of the imports
     */
    imports?.code && sourcemap.concat(imports.code);

    /**
     * The creation of the bundle object that controls the execution in development environment
     */
    bundleCreation(targetedExport, local, imports, sourcemap);

    /**
     * Process the scripts exposed by the processors
     */
    processScripts(targetedExport, sourcemap);

    /**
     * Process the internal modules exposed by the processors
     */
    processIMs(targetedExport, transversal, local, sourcemap);

    /**
     * Process the exports of the bundle
     */
    processExports(targetedExport, transversal, local, sourcemap);

    /**
     * Only required for .jsx legacy processor support
     */
    if (processors.has('jsx')) {
        sourcemap.concat(`const React = ${imports.get('react').variable};`);
        sourcemap.concat(`const ReactDOM = ${imports.get('react-dom').variable};`);
    }

    sourcemap.concat(`__bundle.${local.hmr ? 'update' : 'initialise'}(ims);`);

    const {code, map} = sourcemap;
    return {code, map};
}
