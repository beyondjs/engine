module.exports = async function ({modules}, distribution) {
    await modules.ready;

    const promises = [];
    modules.forEach(module => promises.push(module.ready));
    await Promise.all(promises);

    promises.size = 0;
    modules.forEach(module => promises.push(module.bundles?.ready));
    await Promise.all(promises);

    promises.size = 0;
    modules.forEach(module => module.bundles.forEach(bundle => promises.push(bundle.ready)));
    await Promise.all(promises);

    const packagers = new Map();
    for (const module of modules.values()) {
        for (const bundle of module.bundles.values()) {
            packagers.set(bundle.id, bundle.packagers.get(distribution));
        }
    }

    promises.size = 0;
    packagers.forEach(packager => promises.push(packager.ready));
    await Promise.all(promises);

    return packagers;
}