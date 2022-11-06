const {header} = require('beyond/utils/code');
const SourceMap = require('../../sourcemap');

module.exports = function (jscode, hmr, transversal) {
    'use strict';

    // const {packager} = jscode;
    // const {application, bundle, processors, dependencies} = packager;

    if (!processors.size) {
        sourcemap.concat('// No processors found');
        return {sourcemap};
    }



    // Process the exports
    require('./exports')(packager, hmr, bkb, sourcemap, transversal);

    if (bkb) {
        sourcemap.concat('const __bp = {};');
        sourcemap.concat(`ims.get('./base/index').creator(() => 0, __bp);`);
        sourcemap.concat('__bundle = new __bp.BeyondPackage(__pkg.exports);');
    }

    // Initialise package
    const initialisation = require('./initialisation')(packager, hmr);
    initialisation && sourcemap.concat(initialisation);

    console.log('@TODO: set the sourcemap sourceRoot');
    // map.sourceRoot = specs.platform === 'web' ? '/' : `${process.cwd()}/`;

    return {sourcemap};
}
