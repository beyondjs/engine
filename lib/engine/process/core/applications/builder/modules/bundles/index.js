const {platforms: {node}} = global;

/**
 * Build module bundles
 *
 * @param specs {builder, module, distribution, processSpecs}
 * @returns {Promise<void>}
 */
module.exports = async function (specs) {
    'use strict';

    const {builder, module, distribution, processSpecs} = specs;
    const {application} = builder;
    const {npm, platform} = distribution;
    if ((npm || node.includes(platform)) && application.package !== module.container.package) {
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
            if (distribution.npm) {
                await require('./npm')({...specs, bundle, language});
                await require('./npm/css')({...specs, bundle, language});
                return;
            }

            await require('./bundle')('.js', {...specs, bundle, language});
            processSpecs.build && await require('./bundle')('.css', {...specs, bundle, language});
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