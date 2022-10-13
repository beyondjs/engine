const {URL} = require('url');
const {join} = require('path');

const listener = async function (packages, specs, rq, response) {
    'use strict';

    const url = new URL(rq.url, 'void://');

    if (url.pathname === '/favicon.ico') {
        const file = join(__dirname, 'info/static/favicon.ico');
        response({file});
        return;
    }

    const done = resource => response(resource);

    const resource = await require('./package')(url, packages);
    if (resource) return done(resource);

    return done({content: `Resource "${rq.url}" not found`, contentType: 'text/plain', statusCode: 404});
}

module.exports = (packages, specs) => (rq, resp) => {
    const response = require('./response')(resp, specs);

    listener(packages, specs, rq, response).catch(exc => {
        console.log(exc.stack);

        response({
            content: `Error caught processing request: ${exc.message}`,
            contentType: 'text/plain',
            statusCode: 500
        });
    });
}
