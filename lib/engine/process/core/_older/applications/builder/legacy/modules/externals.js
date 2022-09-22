/**
 * Set externals dependencies
 */
module.exports = async function (packager, distribution, externals) {
    await packager.ready;
    await packager.processors.ready;

    if (!packager.processors.has('ts')) return;
    const processor = packager.processors.get('ts');
    await processor.ready;

    processor.dependencies.forEach(dependency => {
        if (dependency.kind === 'bundle' || !!dependency.internal) return;

        externals.all.add(dependency.resource);
        const find = global.platforms.webAndMobile.includes(distribution.platform);
        find && externals.client.add(dependency.resource);
    });
}