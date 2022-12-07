const p = require("path");
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
    const clientDeps = new Set(dependencies.clientDependencies.concat(externals.client.size ? [...externals.client.values()] : []));

    let json = {
        name: `${scope ? `@${scope}/` : ''}${name}`, version: version,
        title: title, description: description, author: author, license: license,
        keywords: [], static: statics,
        scripts: {}, exports,
        dependencies: dependencies.items,
        devDependencies: dependencies.devDependencies,
        uimport: externals.all.size ? [...externals.all.values()] : true,
        clientDependencies: [...clientDeps.values()]
    };

    const {application} = builder;
    const packageJson = await fs.readFile(p.join(application.path, 'package.json'), 'utf8');
    json = Object.assign(json, JSON.parse(packageJson));

    const target = require('path').join(paths.www, 'package.json');
    await fs.save(target, JSON.stringify(json, null, 2));
}