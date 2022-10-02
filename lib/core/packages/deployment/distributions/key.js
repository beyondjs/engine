const crc32 = require('beyond/utils/crc32');
const equal = require('beyond/utils/equal');

module.exports = function (config) {
    const {platform, environment, minify, bundles, ts} = config;
    return crc32(equal.generate({platform, environment, minify, bundles, ts}));
}
