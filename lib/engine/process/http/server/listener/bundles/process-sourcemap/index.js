const { relative, sep, normalize } = require('path');
const { pathToFileURL } = require('url');

module.exports = function (bundle, input, platform) {
	let map = typeof input === 'object' ? JSON.stringify(input) : input;
	map = JSON.parse(map);

	if (!bundle.path) return map;

	if (platform === 'node') {
		/**
		 * the slash is added at the end of the path to ensure the operation of the sourcemaps
		 */
		const path = bundle.path.endsWith(sep) ? bundle.path : `${bundle.path}${sep}`;
		map.sourceRoot = pathToFileURL(path);
	} else {
		map.sourceRoot = relative(process.cwd(), bundle.path);
		map.sourceRoot = sep === '/' ? map.sourceRoot : map.sourceRoot.replace(/\\/g, '/');
		map.sourceRoot = `/${map.sourceRoot}`;
	}

	return map;
};
