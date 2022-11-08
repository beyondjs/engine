const p = require('path');
const {utils: {fs}} = global;
const BUNDLES_MODE = {esm: 'mjs', cjs: 'cjs', amd: 'amd', sjs: 'sjs'};

/**
 * Build a bundle of a module
 *
 * @param specs {object} {path, module, bundle, distribution, language, uglifier, builder, exports, externals}
 * @specs path {string} The build target path
 * @specs module {object} The module
 * @specs bundle {object} The bundle being exported
 * @specs distribution {object} The distribution specification
 * @specs language {string} The language
 * @specs uglifier {object}
 * @specs builder {object} The builder object
 * @specs exports {Map<string>} The resources being exported
 * @specs externals {object:{all:Set<string>, client:Set<string>}} The externals resources
 * @return {Promise<void>}
 */
module.exports = async function (specs) {
    const {path, module, bundle, distribution, language, uglifier, builder, exports, externals} = specs;

    const packagers = await require('./packagers')(specs);
    const resourcePath = p.join(path, module.subpath);
    await fs.mkdir(resourcePath, {'recursive': true});
    const bName = bundle.subpath + (language ? `.${language}` : '');
    const items = {subpath: bName, extensions: [], platforms: [...module.platforms]};

    const save = async (target, code, packager, extension) => {
        // adding sourcemaps
        code = await require('../sourcemaps')(bundle, code, '.js', resourcePath, distribution.maps, extension);
        if (!distribution.compress) {
            builder.emit('message', `  . File ${bName}.${extension} saved.`);
            return fs.save(target, code);
        }

        let errors;
        ({code, errors} = uglifier.uglify(target, code));
        errors && builder.emit('error', `  . Error uglifying bundle "${bundle.subpath}"`);
        errors?.forEach(({message, line, col}) => builder.emit('error', `    -> [${line}, ${col}] ${message}`));
        !errors && await fs.save(target, code);
    };

    const promises = [];
    const process = (packager, key) => {
        if (!packager.js) return;

        const code = packager.js;
        if (!code.valid) {
            const error = `  . Bundle "${bundle.name}" is not valid`;
            builder.emit('error', error, {module: module.id});
            return;
        }
        if (!code.code() || !code.processorsCount) return;

        const [platform, type] = key.split('//');
        let extension = `${BUNDLES_MODE[type]}.js`;
        if (type === 'esm') extension = platform === 'web' ? 'browser.mjs' : 'mjs';

        items.extensions.push(extension);
        const target = p.join(resourcePath, `${bName}.${extension}`);
        promises.push(save(target, code, packager, extension));
    };
    packagers.forEach(process);
    await Promise.all(promises);

    await require('./externals')(packagers, distribution, externals);

    // Get first packager to generate bundle files
    const [packager] = packagers.values();
    await require('../sourcemaps/sources')(distribution.maps, packager, 'ts', p.join(path, bundle.subpath));

    if (exports.has(bundle.specifier)) {
        items.platforms = exports.get(bundle.specifier).platforms.concat(items.platforms);
        items.extensions = exports.get(bundle.specifier).extensions.concat(items.extensions);
    }

    const declaration = await require('./declarations')(bundle, path, builder);
    !!declaration && items.extensions.push('d.ts');

    exports.set(bundle.specifier, items);
}