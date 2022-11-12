module.exports = function (specs, response) {
    'use strict';

    const {message, statusCode, contentType} = specs;

    try {
        response.writeHead(statusCode ?? 200, {
            'Content-Type': contentType ?? 'text-plain',
            'Content_Length': message.length
        });
        response.write(message);
        response.end();
    }
    catch (exc) {
        console.log(exc.stack);
    }
}
