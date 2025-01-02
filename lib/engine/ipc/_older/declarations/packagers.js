module.exports = async function (application, model) {
    await application.modules.ready;

    const promises = [];
    application.modules.forEach(module => promises.push(module.ready));
    await Promise.all(promises);

    promises.size = 0;
    application.modules.forEach(module => promises.push(module.bundles?.ready));
    await Promise.all(promises);

    promises.size = 0;
    application.modules.forEach(module => module.bundles.forEach(bundle => promises.push(bundle.ready)));
    await Promise.all(promises);

    const packagers = new Map();
    for (const module of application.modules.values()) {
        for (const bundle of module.bundles.values()) {
            const {application, platforms} = bundle.container;
            const distribution = await model.distribution(application.id, bundle, platforms);
            distribution && packagers.set(bundle.id, bundle.packagers.get(distribution));
        }
    }

    promises.size = 0;
    packagers.forEach(packager => promises.push(packager.ready));
    await Promise.all(promises);

    return packagers;
}