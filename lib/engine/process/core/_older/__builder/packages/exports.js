const {utils: {fs}, platforms: {node, webAndMobile}} = global;
module.exports = async function (exported, {www}, {npm, platform}) {
    const exports = {};

    const platforms = npm ? Object.keys(npm.platforms) : [platform];
    if (!!platforms.find(p => p === 'backend')) {
        exports['./actions.specs.json'] = './actions.specs.json';
    }

    const promises = [];
    exported.forEach((item, exp) => {
        if (!npm) {
            node.includes(platform) && (exports[`./${item}`] = `./${item}.js`);
            webAndMobile.includes(platform) && (exports[`./${exp}`] = `./${exp}.js`);
            return;
        }

        const {subpath, extensions} = item;
        let moduleJson = {}, exportJson = {};
        extensions.map(ext => {
            const {jsonS, jsonE} = require('./process')(ext, subpath);
            if (jsonS.hasOwnProperty('node')) {
                moduleJson.node = Object.assign(moduleJson.node ?? {}, jsonS.node);
                exportJson.node = Object.assign(exportJson.node ?? {}, jsonE.node);
            }
            else {
                moduleJson = Object.assign(moduleJson, jsonS);
                exportJson = Object.assign(exportJson, jsonE);
            }
        });

        exports[`./${subpath}`] = exportJson;
        const path = require('path').join(www, subpath, 'package.json')
        promises.push(fs.save(path, JSON.stringify(moduleJson, null, 2)));
    });
    await Promise.all(promises);

    return exports;
}