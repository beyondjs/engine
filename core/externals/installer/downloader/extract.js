const {promises: fs, createReadStream} = require('fs');
const tar = require('tar-stream');
const zlib = require('zlib');
const {sep, join} = require('path');

module.exports = (source, target) => new Promise((resolve, reject) => {
    const extract = tar.extract();

    let chunks = [];
    extract.on('entry', function (header, stream, next) {
        stream.on('data', chunk => chunks.push(chunk));

        stream.on('end', () => {
            const file = (() => {
                const file = header.name.split(sep);
                file[0] === 'package' && file.shift();
                return join(target, file.join('/'));
            })();

            const data = Buffer.concat(chunks);
            chunks.length = 0;
            const dirname = require('path').dirname(file);

            fs.mkdir(dirname, {recursive: true})
                .then(() => fs.writeFile(file, data))
                .then(next);
        });

        stream.resume();
    });

    extract.on('finish', resolve);

    const gunzip = zlib.createGunzip();
    gunzip.on('error', error => reject(error));

    try {
        createReadStream(source)
            .pipe(gunzip)
            .pipe(extract);
    }
    catch (exc) {
        reject(exc);
    }
});
