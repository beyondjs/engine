const p = require('path');
const fs = require('beyond/utils/fs');
const BUNDLES_MODE = {esm: 'mjs', cjs: 'cjs', amd: 'amd', sjs: 'sjs'};

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
 * @specs exports {Map<string>} The resources being exported
 * @specs externals {object:{all:Set<string>, client:Set<string>}} The externals resources
 * @return {Promise<void>}
 */
module.exports = async function (extname, specs) {
    const {path, module, bundle, distribution, language, uglifier, builder, exports, externals} = specs;

    const packagers = await require('./packagers')(specs);
    const resourcePath = p.join(path, module.subpath);
    await fs.mkdir(resourcePath, {'recursive': true});
    const bName = bundle.subpath + (language ? `.${language}` : '');
    const items = {exportName: bName, extensions: []};

    const save = async (target, code, packager, extension) => {
        // adding sourcemaps
        code = await require('../sourcemaps')(bundle, code, extname, resourcePath, distribution.maps, extension);
        if (!distribution.compress) {
            await fs.save(target, code);
            return;
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
            builder.emit('error', `  . Bundle "${bundle.subpath}" is not valid`);
            return;
        }
        if (!code.code() || !code.processorsCount) return;

        const type = key.split('//')[1];
        const extension = type === 'esm' ? 'mjs' : `${BUNDLES_MODE[type]}.js`;

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
        items.extensions = exports.get(bundle.specifier).extensions.concat(items.extensions);
    }

    const declaration = await require('./declarations')(bundle, path);
    if (!declaration) builder.emit('error', `  . Could not generate "${bundle.subpath}" declaration`);
    else items.extensions.push('d.ts');

    exports.set(bundle.specifier, items);
}
