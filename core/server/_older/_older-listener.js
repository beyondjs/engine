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
}
