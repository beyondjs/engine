const util = require('util');
const zlib = require('zlib');
const gzip = util.promisify(zlib.gzip);

module.exports = content => gzip(content);
