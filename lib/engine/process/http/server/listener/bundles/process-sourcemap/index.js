const {relative, sep} = require('path');
const {pathToFileURL} = require('url');

module.exports = function (bundle, input, platform) {
    let map = typeof input === 'object' ? JSON.stringify(input) : input;
    map = JSON.parse(map);
    if (!bundle.path) return map;

    if (platform === 'node') {
        map.sourceRoot = pathToFileURL(bundle.path);
    }
    else {
        map.sourceRoot = relative(process.cwd(), bundle.path);
        map.sourceRoot = sep === '/' ? map.sourceRoot : map.sourceRoot.replace(/\\/g, '/');
        map.sourceRoot = `/${map.sourceRoot}`;
    }

    return map;
}