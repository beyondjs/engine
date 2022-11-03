const {URL} = require("url");
/**
 *
 * @returns {Function}
 */
module.exports = () => async function (request, response) {
    'use strict';

    const url = (() => {
        const url = new URL(request.url, 'http://127.0.0.1');
        // Note: in AMD mode, the querystring is not allowed (it is used require.undef by the beyond.reload method)
        const {pathname} = url;
        if (pathname.endsWith('.hmr.js')) {
            url.pathname = `${pathname.slice(0, pathname.length - 7)}.js`;
            url.searchParams.append('hmr', true);
        }
        return url;
    })();
    const respond = await require('./respond')(url, response);

    try {
        if (url.pathname === '/uploader') {
            await require('./uploader')(response, {request: request});
            return;
        }

        respond(new global.Resource({404: 'Resource not found'}));
    }
    catch (exc) {
        !(exc instanceof global.errors.StandardError) ? console.error(`${exc.stack}\n`) : null;
        respond(new global.Resource({'500': exc.message}));
    }
}
