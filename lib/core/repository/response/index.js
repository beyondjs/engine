const fs = require('beyond/utils/fs');
const {extname} = require('path');
const gzip = require('./gzip');
const contentTypes = (require('./content-types'));

async function process(resource, response, specs) {
    if (!resource) throw new Error('Response resource is not defined');

    const {statusCode, content, contentType, encoding} = await (async () => {
        let {statusCode} = resource;
        statusCode = statusCode ? statusCode : 200;

        let {content, file, encoding, contentType} = resource;
        if (content && !contentType) throw new Error('Content type must be specified');
        if (file && content) throw new Error('Properties file and content cannot be set both at the same time');
        if (!file && !content) throw new Error('Property file of content must be specified');

        if (file) {
            if (!(await fs.exists(file))) {
                statusCode = '404';
                content = `File "${resource.file}" not found`;
                const contentType = 'text/plain';
                const encoding = 'utf8';
                return {statusCode, content, contentType, encoding};
            }

            const ext = extname(file);
            contentType = contentTypes.get(ext);

            encoding = contentTypes.plain(contentType) ? 'utf8' : 'binary';
            content = await fs.readFile(resource.file, encoding);

            encoding = specs.gzip ? 'binary' : encoding;
            content = specs.gzip ? await gzip(content) : content;
        }

        encoding = encoding ? encoding : 'utf8';
        return {statusCode, content, contentType, encoding};
    })();

    try {
        const head = {
            'Content-Type': contentType,
            'Content_Length': content.length,
            'Access-Control-Allow-Origin': '*'
        };
        specs.gzip && (head['Content-Encoding'] = 'gzip');

        response.writeHead(statusCode, head);
        response.write(content, encoding);
        response.end();
    }
    catch (exc) {
        console.log(exc.stack);
    }
}

module.exports = (response, specs) => resource => {
    process(resource, response, specs).catch(exc => console.error(exc.stack));
}
