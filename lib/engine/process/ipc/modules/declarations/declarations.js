const declarations = new Map();

module.exports = async function (packager, distribution, builder) {
    'use strict';

    const process = async declaration => {
        if (declarations.has(declaration.id)) {
            await declaration.save();
            return;
        }

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
            const {id, name} = bundle.container;
            const error = `  . Could not generate "${name}" declaration.`;
            builder.emit('error', error, {module: id});
            errors?.forEach((message) => builder.emit('error', `    -> ${message}`, {module: id}));
            return;
        }

        try {
            await declaration.save();
            builder.emit('message', `  . Declaration ${bundle.container.name} processed`);
            declarations.set(id, declaration);
        }
        catch (exc) {
            builder.emit('error', `  . ${exc.message}`, {main: true, module: id});
        }
    }
    await process(packager.declaration);
}