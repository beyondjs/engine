const gzip = require('./gzip');

module.exports = function (specs, response) {
    'use strict';

    const {content, statusCode, contentType} = specs;

    const done = (content) => {
        try {
            response.writeHead(statusCode ?? 200, {
                'Content-Type': contentType ?? 'text-plain',
                'Content_Length': content.length
            });
            response.write(content);
            response.end();
        }
        catch (exc) {
            console.log(exc.stack);
        }
    }

    if (!specs.gzip) return done(content);
    gzip(content).then(done).catch(exc => console.log(exc.stack));
}
