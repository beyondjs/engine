const p = require('path');
const {fs} = global.utils;
const processed = new Set();

const getDeclaration = async bundle => {
    const {application, platforms} = bundle.container;
    const distribution = await require('./distribution')(application, bundle, platforms);
    if (!distribution) return;
    const {declaration, processors} = bundle.packagers.get(distribution);
    await processors.ready;
    const processor = processors.get('ts');
    await processor.options.ready;

    return {declaration: declaration, tsconfig: processor.options.content}
}

module.exports = async function (bundle, path, builder) {
    const processDeclaration = async (declaration, tsConfig) => {
        if (processed.has(declaration.id)) return declaration.id;

        await declaration.ready;
        const {id, valid, code, errors, packager} = declaration;
        const {subpath} = packager.bundle;
        if (!valid || errors.length) {
            builder.emit('error', `  . Could not generate "${subpath}" declaration, ${errors.join(', ')}`);
            return;
        }

        try {
            const dest = p.join(path, subpath, `${subpath}.d.ts`);
            await fs.save(dest, code, 'utf8');
            const destTs = p.join(path, subpath, `tsconfig.json`);
            await fs.save(destTs, tsConfig, 'utf8');
            processed.add(id);
            return id;
        }
        catch (exc) {
            console.error(exc.message);
        }
    }

    const declaration = await getDeclaration(bundle);
    return processDeclaration(declaration.declaration, declaration.tsconfig);
}