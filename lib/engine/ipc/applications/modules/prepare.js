/**
 * Prepare the bundles of the application modules
 * @param collection
 * @returns {Promise<void>}
 */
module.exports = async function (collection) {
    const promises = [];
    collection.forEach(application => !application.error && promises.push(application.modules.ready));
    await Promise.all(promises);

    promises.size = 0;
    collection.forEach(application =>
        !application.error && application.modules.forEach(module => promises.push(module.ready))
    );
    await Promise.all(promises);

    promises.size = 0;
    collection.forEach(application =>
        !application.error && application.modules.forEach(module => promises.push(module.bundles?.ready))
    );
    await Promise.all(promises);
}