const {relative, sep} = require('path');
const {pathToFileURL} = require('url');

module.exports = function (bundle, input, platform) {
    let map = typeof input === 'object' ? JSON.stringify(input) : input;
    map = JSON.parse(map);
    if (platform === 'node') {
        bundle.path && (map.sourceRoot = pathToFileURL(bundle.path));
    }
    else if (bundle.path) {

        map.sourceRoot = relative(process.cwd(), bundle.path);
        map.sourceRoot = sep === '/' ? map.sourceRoot : map.sourceRoot.replace(/\\/g, '/');
        map.sourceRoot = `/${map.sourceRoot}`;
    }

    return map;
}