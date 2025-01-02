module.exports = function (response, resource) {
    'use strict';

    try {
        const content = resource.content ? resource.content : '500 - Internal server error';

        response.writeHead(500, {
            'Content-Type': resource.contentType,
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
