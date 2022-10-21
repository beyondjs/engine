const {utils: {fs}, platforms: {node, webAndMobile}} = global;
module.exports = async function (exported, {www}, {npm, platform}) {
    const exports = {};

    const platforms = npm ? Object.keys(npm.platforms) : [platform];
    if (!!platforms.find(p => p === 'backend')) {
        exports['./actions.specs.json'] = './actions.specs.json';
    }

    const promises = [];
    exported.forEach((entry, exp) => {
        if (!npm) {
            node.includes(platform) && (exports[`./${entry}`] = `./${entry}.js`);
            webAndMobile.includes(platform) && (exports[`./${exp}`] = `./${exp}.js`);
            return;
        }

        const json = {};
        const {subpath, extensions} = entry;
        exports[`./${subpath}`] = {};
        extensions.forEach(ext => {
            if (ext === 'mjs') {
                json.node = {...json.node, import: `./${subpath}.${ext}`};
                exports[`./${subpath}`].node = {
                    ...exports[`./${subpath}`].node, import: `./${subpath}/${subpath}.${ext}`
                };
                return;
            }

            if (ext === 'cjs.js') {
                json.node = {...json.node, require: `./${subpath}.${ext}`};
                exports[`./${subpath}`].node = {
                    ...exports[`./${subpath}`].node, require: `./${subpath}/${subpath}.${ext}`
                };
                return;
            }

            let type;
            ext === 'd.ts' && (type = 'types');
            ext === 'sjs.js' && (type = 'sjs');
            ext === 'amd.js' && (type = 'amd');

            json[type] = `./${subpath}.${ext}`;
            exports[`./${subpath}`][type] = `./${subpath}/${subpath}.${ext}`;
        });

        const path = require('path').join(www, subpath, 'package.json')
        promises.push(fs.save(path, JSON.stringify(json, null, 2)));
    });
    await Promise.all(promises);

    return exports;
}