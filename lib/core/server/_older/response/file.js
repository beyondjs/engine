const fs = void 0; // require('fs').promises;
const gzip = require('./gzip');

module.exports = async function (response, resource, distribution) {
    'use strict';


    try {
        const head = {
            'Content-Type': resource.contentType,
            'Content_Length': content.length,
            'Access-Control-Allow-Origin': '*'
        };
        distribution.gzip && (head['Content-Encoding'] = 'gzip');

        response.writeHead(200, head);
        response.write(content, !plain.includes(resource.contentType) || distribution.gzip ? 'binary' : 'utf8');
        response.end();
    }
    catch (exc) {
        require('./500.js')(response, exc);
        console.log(exc.stack);
    }
}
