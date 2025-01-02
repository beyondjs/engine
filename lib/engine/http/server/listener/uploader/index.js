require('http');
const {fs} = global.utils;
const {join} = require('path');
const Formidable = require('formidable');

const ROUTE = 'static';
const HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Authorization, X-API-KEY, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Allow-Request-Method',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS, PUT, DELETE',
    'Allow': 'GET, POST, OPTIONS, PUT, DELETE'
};

module.exports = async function (response, resource) {
    try {
        const tmpPath = join(__dirname, 'uploads');
        if (!await fs.exists(tmpPath)) {
            await fs.mkdir(tmpPath);
        }

        const form = new Formidable({multiples: true, uploadDir: tmpPath});
        form.once('error', error => console.error(error));

        form.parse(resource.request, async (err, fields, files) => {
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