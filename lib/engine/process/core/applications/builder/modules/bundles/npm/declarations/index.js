const p = require('path');
const {fs} = global.utils;
const processed = new Set();

const getDeclaration = async (bundle, builder) => {
    const {id, application, platforms} = bundle.container;
    const distribution = await require('./distribution')(application, bundle, platforms);
    if (!distribution) {
        builder.emit('error', `Distribution not found for bundle "${bundle.specifier}"`, {module: id});
        return;
    }

    const {declaration, processors} = bundle.packagers.get(distribution);
    await processors.ready;
    const processor = processors.get('ts');

    if (!processor) {
        builder.emit('error', `Processor "ts" not found for bundle "${bundle.specifier}"`, {module: id});
        return;
    }

    await processor.options.ready;
    return {declaration: declaration, tsConfig: processor.options.content};
}

module.exports = async function (bundle, path, builder) {
    const processDeclaration = async ({declaration, tsConfig}) => {
        if (processed.has(declaration.id)) return declaration.id;

        await declaration.ready;
        const {id, valid, code, errors, packager} = declaration;
        const {container, subpath} = packager.bundle;
        if (!valid || errors.length) {
            const error = `  . Module "${container.name}" declaration not valid.`;
            builder.emit('error', error, {main: true, module: container.id});
            errors?.forEach((message) => builder.emit('error', `    -> ${message}`, {module: container.id}));
            return;
        }

        try {
            const dest = p.join(path, subpath, `${subpath}.d.ts`);
            await fs.save(dest, code, 'utf8');
        }
        catch (exc) {
            const error = `  . Could not generate "${container.name}" declaration.`;
            builder.emit('error', error, {main: true, module: container.id});
        }

        try {
            const destTs = p.join(path, subpath, `tsconfig.json`);
            await fs.save(destTs, tsConfig, 'utf8');
        }
        catch (exc) {
            const error = `  . Could not generate tsconfig file for module "${container.name}".
                Validate that the file exists or is in the folder that the bundle files point to in the module.json file`;
            builder.emit('error', error, {main: true, module: container.id});
        }

        processed.add(id);
        return id;
    }

    const declaration = await getDeclaration(bundle, builder);
    if (!declaration) return;
    return processDeclaration(declaration);
}