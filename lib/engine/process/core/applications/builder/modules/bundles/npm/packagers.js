const {platforms: {nodeExceptSSR}} = global;

module.exports = async function ({module, bundle, distribution, language}) {
    const packagers = new Map();
    const modulePlatforms = [...module.platforms.keys()];

    const setPackager = (platform, mode) => {
        const key = `${platform}//${mode}`;
        if (packagers.has(key)) return;

        const dist = Object.assign({}, distribution,
            {key: key, npm: true, platform: platform, bundles: {mode: mode}}
        );
        delete dist.platforms;
        packagers.set(key, bundle.packagers.get(dist, language));
    };

    for (const platform of modulePlatforms) {
        if (nodeExceptSSR.includes(platform)) {
            setPackager(platform, 'cjs');
            setPackager(platform, 'esm');
            continue;
        }
        if (platform === 'ssr') {
            setPackager(platform, 'amd');
            setPackager(platform, 'sjs');
            setPackager(platform, 'esm');
            continue;
        }
        setPackager('web', 'amd');
        setPackager('web', 'sjs');
        setPackager('web', 'esm');
    }

    const promises = [];
    packagers.forEach(packager => packager.js && promises.push(packager.js.ready));
    await Promise.all(promises);

    console.log('packagers', [...packagers.keys()])
    return packagers;
}