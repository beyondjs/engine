module.exports = function (response, resource) {
    'use strict';

    try {
        const content = resource.content ? resource.content : '404 - not found';

        response.writeHead(404, {
            'Content-Type': resource.contentType ?? 'text-plain',
            'Content_Length': content.length,
            'Access-Control-Allow-Origin': '*'
        });
        response.write(content);
        response.end();
    }
    catch (exc) {
        console.log(exc.stack);
    }
}
