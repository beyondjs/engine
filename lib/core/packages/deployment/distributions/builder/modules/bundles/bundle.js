const p = require('path');
const fs = require('beyond/utils/fs');

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
        builder.emit('error', `  . Bundle "${bundle.specifier + extname}" is not valid`);
        return;
    }
    if (!code.processorsCount || !code.code()) return;

    await require('./externals')(packager, distribution, externals);

    const {specifier, rname, subpath} = bundle;
    const bName = rname + (language ? `.${language}` : '');
    let items = {exportName: bName, extensions: []};
    if (exports.has(specifier)) {
        const bundleExport = exports.get(specifier);
        bundleExport.extensions && (items.extensions = bundleExport.extensions.concat(items.extensions));
    }
    exports.set(specifier, subpath.replace(/\\/g, '/'));

    const type = extname === '.js' ? 'js' : 'css.js';
    const targetPath = p.join(path, subpath.replace(rname, ''));
    const buildCode = await require('./sourcemaps')(bundle, code, extname, targetPath, distribution.maps, type);
    await require('./sourcemaps/sources')(distribution.maps, packager, 'ts', path);

    const resource = builder.application.package !== module.container.package ? `packages/${bundle.vspecifier}` : subpath;
    const filename = resource + (language ? `.${language}` : '') + extname;
    const target = p.join(path, filename);
    if (!distribution.compress) {
        return fs.save(target, buildCode);
    }

    let errors;
    ({code, errors} = uglifier.uglify(target, buildCode));
    errors && builder.emit('error', `  . Error uglifying bundle "${subpath}"`);
    errors?.forEach(({message, line, col}) => builder.emit('error', `    -> [${line}, ${col}] ${message}`));
    !errors && await fs.save(target, code);
}