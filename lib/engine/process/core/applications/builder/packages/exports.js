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
        const {exportName, extensions} = entry;
        exports[`./${exportName}`] = {};
        extensions.forEach(ext => {
            if (ext === 'mjs') {
                json.module = json.import = `./${exportName}.${ext}`;
                const entry = `./${exportName}/${exportName}.${ext}`;
                exports[`./${exportName}`] = {...exports[`./${exportName}`], ...{import: entry, module: entry}};
                return;
            }

            let type;
            ext === 'd.ts' && (type = 'types');
            ext === 'amd.js' && (type = 'amd');
            ext === 'sjs.js' && (type = 'sjs');
            ext === 'cjs.js' && (type = 'require');

            json[type] = `./${exportName}.${ext}`;
            exports[`./${exportName}`][type] = `./${exportName}/${exportName}.${ext}`;
        });

        const path = require('path').join(www, exportName, 'package.json')
        promises.push(fs.save(path, JSON.stringify(json, null, 2)));
    });
    await Promise.all(promises);

    return exports;
}