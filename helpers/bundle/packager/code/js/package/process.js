const {platforms} = global;
const {header} = global.utils.code;

/**
 * Process the bundle code
 *
 * @param jscode {object} The js code packager
 * @param hmr {boolean} Is it an hmr bundle?
 * @param transversal {boolean} Is it a transversal package?
 * @return {object}
 */
module.exports = function (jscode, hmr, transversal) {
    'use strict';

    const {packager} = jscode;
    const {application, bundle, distribution, language, processors, dependencies} = packager;
    const sourcemap = new global.SourceMap();

    // Import module in AMD mode
    const mformat = distribution.bundles.mode;
    if (mformat === 'amd' && !transversal) {
        sourcemap.concat(`import * as _amd_module from 'module';\n`);
    }

    // Add the code of the dependencies
    dependencies.size && (!transversal || hmr) && sourcemap.concat(dependencies.code.code);

    // Process the processors imports and the bundle imports
    // Just for backward compatibility
    (() => {
        const imports = bundle.imports.code(dependencies.code);
        if (!imports) return;

        sourcemap.concat(header('LEGACY IMPORTS'));
        sourcemap.concat(`${imports}\n`);
    })();

    if (!processors.size) {
        sourcemap.concat('// No processors found');
        return sourcemap;
    }

    // The beyond kernel bundle
    const bkb = bundle.specifier === '@beyond-js/kernel/bundle';

    bkb && mformat === 'amd' &&
    sourcemap.concat('const amd_require = require;');

    /**
     * Append the bimport function to solve the version of the packages on dynamic imports.
     * Required in local environment, and not used in node environment
     */
    (() => {
        if (bkb) return; // Exclude bimport in @beyond-js/kernel/bundle
        const {platform, local} = distribution;
        if (!local || platforms.node.includes(platform)) return;

        const {module} = bundle;
        const dependencies = [...module.container.dependencies.packages];
        dependencies.push([module.container.package, module.container.version]);
        dependencies.push([application.package, application.version]);

        sourcemap.concat('const bimport = specifier => {');
        sourcemap.concat(`  const dependencies = new Map(${JSON.stringify(dependencies)});`);
        sourcemap.concat('  return globalThis.bimport(globalThis.bimport.resolve(specifier, dependencies));');
        sourcemap.concat('};');
    })();

    // Create the bundle object
    if (!bkb) {
        if (!transversal || hmr) {
            const pkgProperty = `.package(${bundle.multilanguage ? `'${language}'` : ''});`;

            const bbm = dependencies.code.get('@beyond-js/kernel/bundle');

            if (!hmr) {
                // Create the bundle
                // The name of the var __Bundle (instead of Bundle) is because the ims of the
                // legacy projects (js processor) are not scoped
                sourcemap.concat(`const {Bundle: __Bundle} = ${bbm};`);

                const specs = {
                    module: {
                        vspecifier: bundle.container.vspecifier,
                        multibundle: bundle.container.bundles.size > 1
                    },
                    type: bundle.type,
                    name: bundle.name
                };
                !specs.module.multibundle && delete (specs.module.multibundle);
                specs.type === specs.name && delete specs.name;

                const uri = (() => {
                    if (mformat === 'amd') return ', _amd_module.uri';
                    if (['esm', 'sjs'].includes(mformat)) return ', import.meta.url';
                    return '';
                })();

                const params = JSON.stringify(specs) + uri;

                sourcemap.concat(`const __pkg = new __Bundle(${params})${pkgProperty};`);
            }
            else {
                // Get the bundle instance
                sourcemap.concat(`const {instances} = ${bbm};`);
                sourcemap.concat(`const __pkg = instances.get('${bundle.vspecifier}')${pkgProperty};`);
            }

            // Register the dependencies of the package
            (() => {
                const imports = [];
                [...dependencies.code]
                    .filter(([specifier]) => specifier !== '@beyond-js/kernel/bundle')
                    .forEach(([specifier, name]) => imports.push(`['${specifier}', ${name}]`));
                const code = `[${imports.join(',')}]`;
                sourcemap.concat(`\n__pkg.dependencies.update(${code});\n`);
            })();

            // Just for legacy projects
            application.engine === 'legacy' && sourcemap.concat(`const {module} = __pkg.bundle;`);
        }
    }
    else {
        sourcemap.concat('let __pkg = {exports: {}};');
    }

    // Only required for .jsx legacy processor support
    if (processors.has('jsx')) {
        sourcemap.concat(`const React = ${dependencies.code.get('react')};`);
        sourcemap.concat(`const ReactDOM = ${dependencies.code.get('react-dom')};`);
    }

    // Allows bundles to inject code at the beginning of the bundle
    const precode = jscode._precode();
    precode && sourcemap.concat(precode);

    // Process the scripts code of each processor
    processors.forEach(processor => require('./script')(processor, sourcemap));

    // In transversals, the ims map is received from the creator function
    (!transversal || hmr) && sourcemap.concat('const ims = new Map();\n');

    // Process the ims code of each processor
    processors.forEach(processor => require('./ims')(processor, sourcemap));

    // Process the exports
    require('./exports')(packager, hmr, bkb, sourcemap, transversal);

    if (bkb) {
        sourcemap.concat('const __bp = {};');
        sourcemap.concat(`ims.get('./base/index').creator(() => 0, __bp);`);
        sourcemap.concat('__pkg = new __bp.BeyondPackage(__pkg.exports);');
    }

    // Initialise package
    const initialisation = require('./initialisation')(packager, hmr);
    initialisation && sourcemap.concat(initialisation);

    sourcemap.map.sourceRoot = distribution.platform === 'web' ? '/' : `${process.cwd()}/`;
    return sourcemap;
}
