const {fs} = global.utils;
module.exports = async function (modules, builder, paths, staticEntries, externals, distribution) {
    // save exports on package.json
    const exports = await require('./exports')(modules.exported, paths, distribution);

    const cleanEntry = entry => {
        const i = entry.split('.');
        return i.slice(0, i.length - 1).join('.');
    };
    const statics = {};
    for (const entry of Object.values(staticEntries)) {
        entry && entry.forEach(i => statics[cleanEntry(i)] = i);
    }

    const dependencies = await require('./dependencies')(builder, distribution);
    const {application: {name, scope, title, description, version, author, license}} = builder;

    const pJson = {
        name: `${scope ? `@${scope}/` : ''}${name}`, version: version, author: author,
        title: title, description: description, license: license,
        keywords: [], static: statics, exports, dependencies,
        uimport: externals.all.size ? [...externals.all.values()] : true,
        clientDependencies: externals.client.size ? [...externals.client.values()] : []
    };

    const target = require('path').join(paths.www, 'package.json');
    await fs.save(target, JSON.stringify(pJson, null, 2));
}