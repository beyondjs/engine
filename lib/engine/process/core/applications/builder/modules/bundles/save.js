const p = require("path");
const {fs} = global.utils;

/**
 * Build module bundles
 *
 * @param packager {object}
 * @param code {code}
 * @param extname {string}
 * @param specs {builder, module, distribution, processSpecs}
 * @returns {Promise<void>}
 */
module.exports = async function (packager, code, extname, specs) {
    'use strict';

    const {path, module, bundle, distribution, language, uglifier, builder, exports, externals} = specs;

    await require('./externals')(packager, distribution, externals);

    const {specifier, subpath} = bundle;
    const bName = subpath + (language ? `.${language}` : '');

    const items = {subpath: bName, extensions: [], platforms: module.platforms};
    if (exports.has(specifier)) {
        const bundleExport = exports.get(specifier);
        bundleExport.extensions && (items.extensions = bundleExport.extensions.concat(items.extensions));
    }
    exports.set(specifier, subpath.replace(/\\/g, '/'));

    const type = extname === '.js' ? 'js' : 'css.js';
    const buildCode = await require('./sourcemaps')(bundle, code, extname, path, distribution.maps, type, language);

    const processorName = extname === '.css' ? 'sass' : packager.bundle.name === 'txt' ? 'txt' : 'ts';
    await require('./sourcemaps/sources')(distribution.maps, packager, processorName, path, builder, language);

    const resource =
        builder.application.package !== module.container.package ? `packages/${bundle.vspecifier}` : subpath;
    const filename = resource + (language ? `.${language}` : '') + extname;
    const target = p.join(path, filename);
    if (!distribution.compress) {
        builder.emit('message', `  . File ${filename} saved.`);
        return fs.save(target, buildCode);
    }

    let errors;
    ({code, errors} = uglifier.uglify(target, buildCode));
    errors && builder.emit('error', `  . Error uglifying bundle "${subpath}"`);
    errors?.forEach(({message, line, col}) => builder.emit('error', `    -> [${line}, ${col}] ${message}`));
    !errors && await fs.save(target, code);
}