const {fs} = global.utils;
const {join} = require('path');
module.exports = async function (modules, builder, paths, staticEntries, externals, distribution) {
    // save exports on package.json
    const exports = await require('./exports')(modules.exported, paths, distribution);

    const statics = {};
    for (const entries of Object.values(staticEntries)) {
        entries.forEach(i => statics[i] = i);
    }

    const dependencies = await require('./dependencies')(builder, distribution);
    const {application: {name, scope, title, description, version, author, license}} = builder;
    const clientDeps = new Set(dependencies.clientDependencies.concat(externals.client.size ? [...externals.client.values()] : []));

    const {application} = builder;
    let packageJson = await fs.readFile(join(application.path, 'package.json'), 'utf8');
    packageJson = JSON.parse(packageJson);

    const {scripts, repository, keywords} = packageJson;
    const json = {
        name: `${scope ? `@${scope}/` : ''}${name}`, version,
        title, description, author, license,
        repository: repository ?? '', keywords: keywords ?? [],
        scripts: scripts ?? {}, exports,
        dependencies: dependencies.items, devDependencies: dependencies.devDependencies,
        statics, uimport: externals.all.size ? [...externals.all.values()] : true,
        clientDependencies: [...clientDeps.values()]
    };

    const target = join(paths.www, 'package.json');
    await fs.save(target, JSON.stringify(json, null, 2));
}