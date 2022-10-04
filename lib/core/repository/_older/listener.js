const {URL} = require('url');
const {bundles} = require('beyond/bundlers');

module.exports = packages => async function (request, response) {
    'use strict';

    const url = new URL(request.url, 'void:');
    const respond = await require('./respond')(url, response);
    const done = resource => respond(resource);

    try {
        await bundles.ready;

        if (url.pathname === '/') return await index();

        let resource;
        resource = url.pathname.startsWith('/__info/') && await require('./info/resources')(url.pathname.slice(8));
        if (done(resource)) return;

        resource = await require('./sr')(application, distribution, url);
        if (done(resource)) return;

        resource = await require('./config')(application, distribution, url);
        if (done(resource)) return;

        if (url.pathname === '/project.json') {
            respond(await require('./project')(application));
            return;
        }

        if (url.pathname === '/uploader') {
            await require('./uploader')(response, {request: request});
            return;
        }

        resource = await require('./static')(application, distribution, url);
        if (done(resource)) return;

        if (url.pathname === '/favicon.ico') {
            respond(new global.Resource({404: 'Resource not found'}));
            return;
        }

        resource = await require('./import-map')(application, distribution, url);
        if (done(resource)) return;

        resource = await require('./styles')(application, distribution, url);
        if (done(resource)) return;

        resource = await require('./bundles')(url, application, distribution);
        if (done(resource)) return;

        resource = await require('./externals')(url, application, distribution);
        if (done(resource)) return;

        resource = await require('./sources')(url, application, distribution);
        if (done(resource)) return;

        // Any other resource must return the index.html
        return await index();
    }
    catch (exc) {
        !(exc instanceof global.errors.StandardError) ? console.error(`${exc.stack}\n`) : null;
        respond(new global.Resource({'500': exc.message}));
    }
}
