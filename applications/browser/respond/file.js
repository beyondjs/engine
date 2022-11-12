const fs = require('beyond/utils/fs');
const {extname} = require('path');
const messageResponse = require('./message');
const contentTypes = require('./content-types');
const gzip = require('./gzip');

module.exports = function (specs, response) {
    const {file} = specs;
    const plain = ['text/html', 'text/plain', 'application/javascript', 'text/css', 'text/cache-manifest'];
    const contentType = (() => {
        if (specs.contentType) return specs.contentType;
        if (file) return contentTypes(extname(file));
    })();
    const encoding = plain.includes(contentType) ? 'utf8' : 'binary';

    fs.exists(specs.file)
        .then((exists) => {
            if (!exists) return Promise.reject(`File "${file}" not found`);
        })
        .then(() => {
            return fs.readFile(file, encoding);
        })
        .then((content) => {
            return specs.gzip ? gzip(content) : content;
        })
        .then((content) => {
            const head = {
                'Content-Type': contentType,
                'Content_Length': content.length,
                'Access-Control-Allow-Origin': '*'
            };
            specs.gzip && (head['Content-Encoding'] = 'gzip');

            response.writeHead(200, head);
            response.write(content, encoding);
            response.end();
        })
        .catch(exc => {
            messageResponse({statusCode: 500, message: exc.message}, response);
            console.log(exc.stack);
        });
}
