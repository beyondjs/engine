const {fs} = global.utils;

/**
 * Build module bundles
 *
 * @param builder {object} The builder object
 * @param module {object} The module
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @param externals {Set} The externals
 * @returns {Promise<void>}
 */
module.exports = async function (builder, module, distribution, path, uglifier, externals) {
    'use strict';

    const {bundles} = global;
    await bundles.ready;
    for (const bundle of module.bundles.values()) {
        await bundle.ready;
        if (!!bundles.get(bundle.type).transversal) continue;

        builder.emit('message', `  . Building bundle ${bundle.type}`);

        const build = async (code, extname, language) => {
            await code.ready;
            if (!code.valid) {
                builder.emit('error', `  . Bundle "${bundle.pathname}" is not valid`);
                return;
            }

            if (!code.processorsCount) return;

            if (!code.code()) {
                builder.emit('error', `  . Bundle "${bundle.pathname}" [${extname}] is not emitting any code`);
                return;
            }

            //- remove module.name folder to the build = module.pathname.replace(module.name, '')
            const modulePathname = module.pathname.replace(module.name, '');

            const target = require('path').join(
                path, modulePathname, bundle.subpath + (language ? `.${language}${extname}` : extname)
            );

            if (!distribution.compress) return fs.save(target, code.code());

            let errors;
            ({code, errors} = uglifier.uglify(target, code.code()));

            errors && builder.emit('error', `  . Error uglifying bundle "${bundle.pathname}"`);
            errors?.forEach(({message, line, col}) =>
                builder.emit('error', `    -> [${line}, ${col}] ${message}`));
            !errors && await fs.save(target, code);
        };

        if (bundle.multilanguage) {
            const {application} = builder;
            const languages = application.languages.supported;
            for (const language of languages) {
                const packager = await bundle.packagers.get(distribution, language);
                packager.js && await build(packager.js, '.js', language);
            }
        }
        else {
            const packager = await bundle.packagers.get(distribution);
            packager.js && await build(packager.js, '.js');
        }

        const packager = await bundle.packagers.get(distribution);
        const {processors} = packager;

        await require('./externals')(packager, distribution, externals);

        if (packager.css && !processors.has('scss') && !processors.has('less')) {
            await build(packager.css, '.css');
        }
    }
}
