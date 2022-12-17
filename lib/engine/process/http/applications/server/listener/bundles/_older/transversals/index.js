/**
 * Return the code of a transversal bundle
 *
 * @param application {any} The application object
 * @param distribution {any} The distribution specification
 * @param bundle {any} The transversal bundle
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
    const tp = bundle.packagers.get(distribution, language);
    await tp.ready;

    const {js} = tp;
    await js.ready;

    if (extname === '.json') {
        return await require('../json')(tp, bundle, resource);
    }
    if (info) {
        return new global.Resource({'500': await require('./info')(tp), extname: '.html'});
    }
    else if (map) {
        const map = js.map();
        const content = typeof map === 'object' ? JSON.stringify(map) : map;
        return new global.Resource({content, extname: '.map'});
    }
    else {
        const mode = distribution.maps;
        const content = js.code ? require('../sourcemap')(bundle, js.code(), js.map(), resource.extname, mode) : '';

        return js.valid ?
            new global.Resource({content, extname: resource.extname}) :
            new global.Resource({'500': 'Bundle compiled with errors'});
    }
}
