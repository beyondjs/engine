const util = require('util');
const zlib = require('zlib');
const gzip = util.promisify(zlib.gzip);

module.exports = async function (content) {
    return await gzip(content);
}