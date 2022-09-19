const {platforms: {webAndMobile}} = global;

/**
 * Set externals dependencies
 */
module.exports = async function (packager, distribution, externals) {
    await packager.ready;
    await packager.processors.ready;

    if (!packager.processors.has('ts')) return;
    const processor = packager.processors.get('ts');
    await processor.ready;

    const platforms = distribution.npm ? Object.keys(distribution.npm.platforms) : [distribution.platform];
    processor.dependencies.forEach(dependency => {
        if (dependency.kind === 'bundle' || !!dependency.internal) return;

        externals.all.add(dependency.specifier);
        const find = platforms.find(p => webAndMobile.includes(p));
        find && externals.client.add(dependency.specifier);
    });
}