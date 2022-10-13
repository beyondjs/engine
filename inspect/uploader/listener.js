const fs = require('beyond/utils/fs');
const {join} = require('path');
const Formidable = require('formidable');
const {URL} = require('url');

module.exports = async function (request, response) {
    const url = new URL(request.url, 'void:');
    if (url.pathname !== '/uploader') return;

    const {ROUTE, HEADERS} = require('./constants');

    try {
        const tmpPath = join(__dirname, 'uploads');
        !await fs.exists(tmpPath) && await fs.mkdir(tmpPath);

        const form = new Formidable({multiples: true, uploadDir: tmpPath});
        form.once('error', error => console.error(error));

        form.parse(request, async (err, fields, files) => {
            !files.images?.length && (files.images = [files.images]);

            let path = await require('./path')(fields);
            if (!path) {
                response.end(JSON.stringify({
                    status: false,
                    error: `Path not found for "${fields.type} ${fields.id}"`
                }));
            }

            path = join(path, ROUTE);
            if (!await fs.exists(path)) await fs.mkdir(path);

            const promises = [];
            const regExp = /[^\w\d.]/g;
            files.images.forEach(file => promises.push(fs.rename(file.path, join(path, file.name.replace(regExp, '')))));
            await Promise.all(promises);

            let responseJSON = {status: false};
            if (promises.length === files.images.length) {
                response.writeHead(200, HEADERS);
                const images = files.images.map(image => {
                    const name = image.name.replace(regExp, '');
                    return {
                        name: name, type: image.type,
                        path: join(path, name), pathname: `${ROUTE}/${name}`
                    }
                });
                responseJSON = {status: true, data: images};
            }
            response.end(JSON.stringify(responseJSON));
        });
    }
    catch (exc) {
        console.error(exc.stack);
    }
}
