module.exports = async function (packager, distribution) {
    'use strict';

    const process = async declaration => {
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
        const {valid, errors, packager: {bundle}} = declaration;
        if (!valid || errors.length) {
            let error = [`  . Could not generate "${bundle.specifier}" declaration.`];
            errors?.forEach(message => error.push(`    -> ${message}`));
            return {bundle: bundle.specifier, errors: error};
        }

        try {
            await declaration.save();
        }
        catch (exc) {
            return {bundle: bundle.specifier, errors: [`  . ${exc.message} on  ${bundle.specifier}`]};
        }
    }
    return process(packager.declaration);
}