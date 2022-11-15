const {platforms: {webAndMobile}} = global;

/**
 * Set externals dependencies
 */
module.exports = async function (packager, distribution, externals) {
    await packager.ready;
    await packager.dependencies.ready;

    const platforms = distribution.npm ? Object.keys(distribution.npm.platforms) : [distribution.platform];

    const promises = [];
    packager.dependencies.forEach(dependency => promises.push(dependency.ready));
    await Promise.all(promises);

    packager.dependencies.forEach(dependency => {
        if (dependency.kind === 'bundle' || !!dependency.internal || !!dependency.reserved) return;

        externals.all.add(dependency.specifier);
        !!platforms.find(p => webAndMobile.includes(p)) && externals.client.add(dependency.specifier);
    });
}