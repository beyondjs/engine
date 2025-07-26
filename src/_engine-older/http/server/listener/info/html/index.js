const fs = require('fs').promises;
const path = require('path');
let source;

module.exports = async function (content, statusCode) {
    const html = source ? source : await (async () => {
        return source = await fs.readFile(path.join(__dirname, 'info.html'), 'utf8');
    })();
    let processed = html.replace('##content##', content);

    statusCode = statusCode ? statusCode : '200';

    const resource = {extname: '.html'};
    resource[statusCode === '200' ? 'content' : statusCode] = processed;
    return new global.Resource(resource);
}
