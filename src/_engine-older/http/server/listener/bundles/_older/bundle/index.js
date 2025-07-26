/**
 * Return the code of a bundle
 *
 * @param application {any} The application object
 * @param distribution {any} The distribution specification
 * @param bundle {any} The bundle object
 * @param resource {any} The parsed url
 * @param map {boolean} True if requesting a source map
 * @return {Promise<*>}
 */
module.exports = async function (application, distribution, bundle, resource, map) {
    'use strict';

    const {info, extname} = resource;

    await bundle.ready;
    if (!bundle.valid) {
        const {extname} = resource;
        return info ? await require('./info')({bundle, extname}) :
            new global.Resource({'500': 'Bundle compiled with errors'});
    }

    const {language} = resource;
    const packager = bundle.packagers.get(distribution, language);
    await packager.ready;

    if (extname === '.json') {
        return await require('../json')(packager, bundle, resource);
    }

    return ['.js', '.css'].includes(extname) ?
        await require('./code')(packager, bundle, resource, distribution, map) :
        await require('./declaration')(packager, resource);
}
