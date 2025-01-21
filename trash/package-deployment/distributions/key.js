const crc32 = require('@beyond-js/crc32');
const equal = require('@beyond-js/equal');

module.exports = function (config) {
	const { platform, environment, minify, bundles, ts } = config;
	return crc32(equal.generate({ platform, environment, minify, bundles, ts }));
};
