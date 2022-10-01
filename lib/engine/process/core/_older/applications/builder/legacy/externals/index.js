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
        cache: p.join(process.cwd(), '.beyond/uimport')
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

    //TODO verificar porque estas dependencias no se estan seteando en los externals
    // all.add('dayjs');
    // all.add('react-dom');
    // all.add('emmet-monaco-es');

    await generate(all);
    await require('./static')(processed, application, paths);

    return {all: processed, client};
}