const p = require('path');
const {utils: {fs}, platforms: {webAndMobile}} = global;

module.exports = async function (builder, module, distribution, paths) {
    if (!!distribution.npm || !webAndMobile.includes(distribution.platform)) {
        return module.externals;
    }

    builder.emit('message', 'Copying external resources');

    const {application} = builder;
    const uiSpecs = {
        cwd: application.path, // The working directory
        temp: p.join(application.path, '.beyond/uimport/temp'),
        cache: p.join(process.cwd(), '.beyond/uimport'),
        versions: true
    };

    const processed = new Set();
    const generate = async items => {
        const packages = new Map();

        let arr = [];
        for (const item of items) {
            const identifier = typeof item === 'object' ? item.id : item;
            if (processed.has(identifier)) continue;

            const {
                code, errors, dependencies, pkg, subpath, version
            } = await require('uimport')(identifier, distribution.bundles.mode, uiSpecs);
            if (errors) {
                builder.emit('error', `  . Errors found on external "${identifier}": ${errors}`);
                continue;
            }

            const name = `${pkg.name}@${version}` + (subpath ? `/${subpath.slice(2)}.js` : '.js');
            arr = arr.concat(dependencies, [name]);
            packages.set(name, code);
        }

        const promises = [];
        packages.forEach((code, id) => {
            builder.emit('message', `  . Building resource "${id}"`);
            const path = p.join(paths.www, 'packages', id);
            promises.push(fs.save(path, code));
            processed.add(id);
        });
        await Promise.all(promises);

        const uImport = [...new Set(arr)];
        [...uImport.values()].length && await generate([...uImport.values()]);
    }

    const {all, client} = module.externals;
    // Default dependencies of the index.html are added manually
    all.forEach(item => {
        if (item.startsWith('@beyond-js/kernel')) {
            all.add('@beyond-js/kernel/transversals');
            client.add('@beyond-js/kernel/transversals');
        }
        if (item.startsWith('@beyond-js/widgets')) {
            const items = ['@beyond-js/widgets/render', '@beyond-js/widgets/application', '@beyond-js/widgets/layout'];
            items.forEach(item => {
                all.add(item);
                client.add(item);
            });
        }
    });

    // Hack to validate socket.io-client dependency and add it to build as external package
    let packageJson = await fs.readFile(p.join(application.path, 'package.json'), 'utf8');
    packageJson = JSON.parse(packageJson);
    Object.keys(packageJson.dependencies).includes('socket.io-client') && all.add('socket.io-client');

    await generate(all);
    await require('./static')(processed, application, paths);

    return {all: processed, client};
}