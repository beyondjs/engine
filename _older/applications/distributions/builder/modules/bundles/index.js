const {platforms: {node}} = require('beyond/cspecs');

/**
 * Build module bundles
 *
 * @param builder {object} The builder object
 * @param module {object} The module
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @param exports {Set<string>} The resources being exported
 * @param externals {Set<string>} The externals resources being generated
 * @returns {Promise<void>}
 */
module.exports = async function (builder, module, distribution, path, uglifier, exports, externals) {
    'use strict';

    const {application} = builder;
    if (application.package !== module.container.package && !distribution.npm && node.includes(distribution.platform)) {
        //bundles are not generated when compiled with node distribution and the module is a package from another project
        return;
    }

    const {bundles} = global;
    await bundles.ready;
    for (const bundle of module.bundles.values()) {
        await bundle.ready;
        if (!!bundles.get(bundle.type).transversal) continue;

        builder.emit('message', `  . Building bundle ${bundle.type}`);

        const build = async language => {
            const specs = {path, module, bundle, distribution, language, uglifier, builder, exports, externals};

            if (distribution.npm) {
                await require('./npm')('.js', specs);
                await require('./npm/css')('.css', specs);
                return;
            }

            await require('./bundle')('.js', specs);
            await require('./bundle')('.css', specs);
        };

        if (bundle.multilanguage) {
            const {application} = builder;
            const languages = application.languages.supported;
            const promises = [];
            for (const language of languages) promises.push(build(language));
            await Promise.all(promises);
            continue;
        }
        await build();
    }
}
