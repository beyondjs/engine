const p = require('path');
const {fs} = global.utils;

/**
 * Build a bundle of a module
 *
 * @param extname {string} Can be '.js' or '.css'
 * @param specs {object} {path, module, bundle, distribution, language, uglifier, builder, exports, externals}
 * @specs path {string} The build target path
 * @specs module {object} The module
 * @specs bundle {object} The bundle being exported
 * @specs distribution {object} The distribution specification
 * @specs language {string} The language
 * @specs uglifier {object}
 * @specs builder {object} The builder object
 * @specs exports {Set<string>} The resources being exported
 * @specs externals {Set<string>} The externals resources
 * @return {Promise<void>}
 */
module.exports = async function (extname, specs) {
    const {path, module, bundle, distribution, language, uglifier, builder, exports, externals} = specs;
    const packager = await bundle.packagers.get(distribution, language);

    let code = packager[extname === '.js' ? 'js' : 'css'];
    if (!code) return;

    await code.ready;
    if (!code.valid) {
        builder.emit('error', `  . Bundle "${bundle.subpath}" is not valid`);
        return;
    }
    if (!code.processorsCount || !code.code()) return;

    await require('../externals')(packager, distribution, externals);

    //- remove module.name folder to the build = module.subpath.replace(module.name, '')
    const modulePathname = module.subpath.replace(module.name, '');

    const exported = p.join(modulePathname, bundle.subpath + (language ? `.${language}` : ''));

    const bName = bundle.subpath + (language ? `.${language}` : '');
    let items = {exportName: bName, extensions: []};
    if (exports.has(bundle.resource)) {
        const bundleExport = exports.get(bundle.resource);
        bundleExport.extensions && (items.extensions = bundleExport.extensions.concat(items.extensions));
    }
    exports.set(bundle.resource, items);

    const buildCode = await require('../sourcemaps')(bundle, code, extname, path, distribution.maps, packager);
    const target = p.join(path, module.subpath, `${exported}${extname}`);
    if (!distribution.compress) {
        return fs.save(target, buildCode);
    }

    let errors;
    ({code, errors} = uglifier.uglify(target, buildCode));
    errors && builder.emit('error', `  . Error uglifying bundle "${bundle.subpath}"`);
    errors?.forEach(({message, line, col}) => builder.emit('error', `    -> [${line}, ${col}] ${message}`));
    !errors && await fs.save(target, code);
}
