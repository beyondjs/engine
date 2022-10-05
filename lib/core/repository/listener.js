const {bundles} = require('beyond/bundlers');
const {URL} = require('url');
const {join} = require('path');
const SpecifierParser = require('beyond/utils/specifier-parser');

module.exports = (packages, specs) => async function (rq, res) {
    'use strict';

    const url = new URL(rq.url, 'void://');
    const response = require('./response')(res, specs);

    if (url.pathname === '/favicon.ico') {
        const file = join(__dirname, 'info/static/favicon.ico');
        response({file});
        return;
    }

    await packages.ready;
    console.log([...packages.keys()]);

    const specifier = new SpecifierParser(url.pathname.slice(1));
    console.log('Parsed specifier:', specifier.pkg, specifier.version, specifier.subpath);

    response({content: 'Hello world!', contentType: 'text/plain'});
    return;

    try {
        await bundles.ready;

        let resource;
        resource = url.pathname.startsWith('/__info/') && await require('./info/resources')(url.pathname.slice(8));
        if (response(resource)) return;

        // if (url.pathname === '/favicon.ico') {
        //     respond(new global.Resource({404: 'Resource not found'}));
        //     return;
        // }

        // resource = await require('./sr')(application, distribution, url);
        // if (response(resource)) return;

        // resource = await require('./config')(application, distribution, url);
        // if (response(resource)) return;

        // if (url.pathname === '/project.json') {
        //     respond(await require('./project')(application));
        //     return;
        // }

        // resource = await require('./static')(application, distribution, url);
        // if (response(resource)) return;

        // resource = await require('./import-map')(application, distribution, url);
        // if (response(resource)) return;

        // resource = await require('./styles')(application, distribution, url);
        // if (response(resource)) return;

        // resource = await require('./bundles')(url, application, distribution);
        // if (response(resource)) return;

        // resource = await require('./externals')(url, application, distribution);
        // if (response(resource)) return;

        // resource = await require('./sources')(url, application, distribution);
        // if (response(resource)) return;

        // Any other resource must return the index.html
        // return await index();
    }
    catch (exc) {
        console.log(exc.stack);
        respond(new global.Resource({'500': exc.message}));
    }
}
