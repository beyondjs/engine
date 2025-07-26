module.exports = async function (application, distribution, bundle, resource, info) {
    'use strict';

    if (resource.extname !== '.js') {
        return new global.Resource({'404': `Resource extension "${resource.extname}" is invalid`});
    }

    await bundle.ready;

    // Check language
    const {multilanguage} = bundle;
    const check = resource.checkLanguage(multilanguage);
    if (check.error) return new global.Resource({'404': check.error});

    const {language} = resource;
    const packager = bundle.packagers.get(distribution, language);
    await packager.ready;

    const {processors} = packager;
    await processors.ready;
    if (!processors.has(resource.processor)) {
        return new global.Resource({'404': `Processor "${resource.processor}" not found on resource "${bundle.resource}"`});
    }

    if (info) {
        return await require('./info')(processor, hmr);
    }
    else {
        return hmr.valid ?
            new global.Resource({
                content: hmr.code ? require('../sourcemap')(hmr.code, hmr.map, resource.extname) : '',
                extname: resource.extname
            }) :
            new global.Resource({'500': 'Bundle compiled with errors'});
    }
}
