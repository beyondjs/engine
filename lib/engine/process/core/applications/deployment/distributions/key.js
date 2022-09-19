const {crc32, equal} = global.utils;

module.exports = function (config) {
    const {platform, environment, minify, bundles, ts} = config;
    return crc32(equal.generate({platform, environment, minify, bundles, ts}));
}
