const {URL} = require('url');

/**
 * The http listener that serves an application of an specific distribution
 *
 * @param application {object} The application
 * @param distribution {object} The distribution specification
 * @param local {{inspect: number}} The local engine specification, actually the inspection port
 * @returns {Function}
 */
module.exports = (application, distribution, local) => async function (request, response) {
    'use strict';

    const url = new URL(request.url, 'void:');
    const respond = await require('./respond')(url, response, distribution);

    // The index.html resource
    const index = async function () {
        const language = void 0; // Actually language is not being used in the index.html resource
        respond(await require('./index-html')(application, distribution, language, local));
    }

    try {
        const done = resource => respond(resource);

        if (url.pathname === '/') return await index();

        let resource;
        resource = url.pathname.startsWith('/__info/') && await require('./info/resources')(url.pathname.slice(8));
        if (done(resource)) return;

        if (url.pathname === '/favicon.ico') {
            respond(new global.Resource({404: 'Resource not found'}));
            return;
        }

        resource = await require('./import-map')(application, distribution, url);
        if (done(resource)) return;

        // Any other resource must return the index.html
        return await index();
    }
    catch (exc) {
        !(exc instanceof global.errors.StandardError) ? console.error(`${exc.stack}\n`) : null;
        respond(new global.Resource({'500': exc.message}));
    }
}
