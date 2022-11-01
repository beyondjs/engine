const declarations = new Map();

module.exports = async function (packager, distribution, builder) {
    'use strict';

    const process = async declaration => {
        if (declarations.has(declaration.id)) return;

        const {dependencies} = declaration.packager;
        await dependencies.ready;
        const promises = [];
        dependencies.forEach(dependency => promises.push(dependency.ready));
        await Promise.all(promises);

        for (const dependency of dependencies.values()) {
            if (!dependency.valid) continue;
            if (dependency.kind !== 'bundle') continue;
            const {declaration} = dependency.bundle.packagers.get(distribution);
            await process(declaration);
        }

        await declaration.ready;
        const {id, valid, errors, packager: {bundle}} = declaration;
        if (!valid || errors.length) {
            builder.emit('error', `  . Declaration ${bundle.container.name} not processed. ${errors.join(', ')}`);
        }

        try {
            console.log('declaration.save', declaration.id, bundle.container.name)
            await declaration.save();
            builder.emit('message', `  . Declaration ${bundle.container.name} processed`);
            declarations.set(id, declaration);
        }
        catch (exc) {
            builder.emit('error', `  . ${exc.message}`);
        }
    }
    await process(packager.declaration);
}