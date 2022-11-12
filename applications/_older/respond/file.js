const {fs} = global.utils;
const gzip = require('./gzip');

module.exports = async function (response, resource, distribution) {
    'use strict';

    const plain = ['text/html', 'text/plain', 'application/javascript', 'text/css', 'text/cache-manifest'];

    try {
        if (!(await fs.exists(resource.file))) {
            return require('./404.js')(response, {content: `File "${resource.file}" not found`});
        }

        const encoding = plain.includes(resource.contentType) ? 'utf8' : void 0;
        let content = await fs.readFile(resource.file, encoding);
        content = distribution.gzip ? await gzip(content) : content;

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
