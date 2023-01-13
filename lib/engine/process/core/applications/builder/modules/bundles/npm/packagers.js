const {platforms: {webAndMobile, node}} = global;

module.exports = async function ({module, bundle, distribution, language}) {
    const packagers = new Map();
    const modulePlatforms = [...module.platforms.keys()];

    const setPackager = (platform, mode) => {
        const key = `${platform}//${mode}`;
        console.log(1, key, packagers.has(key))
        if (packagers.has(key)) return;

        //TODO add platform distribution to correspond, only NPM
        const dist = Object.assign({},
            distribution, {key: key, npm: distribution.npm, platform: platform, bundles: {mode: mode}}
        );
        delete dist.platforms;
        packagers.set(key, bundle.packagers.get(dist, language));
    };

    module.name === 'controller' && console.log(1, module.name, module.id, modulePlatforms)
    for (const platform of modulePlatforms) {
        if (node.includes(platform)) {
            setPackager('node', 'cjs');
            setPackager('node', 'esm');
            continue;
        }
        setPackager('web', 'amd');
        setPackager('web', 'sjs');
        setPackager('web', 'esm');
    }

    const {npm: {platforms}} = distribution;
    // for (const platform of Object.keys(platforms)) {
    //     if (webAndMobile.includes(platform) && modulePlatforms.includes(platform)) {
    //         setPackager(platform, 'amd');
    //         setPackager(platform, 'sjs');
    //         setPackager(platform, 'esm');
    //         continue;
    //     }
    //
    //     if (!modulePlatforms.includes(platform)) continue;
    //     setPackager(platform, 'esm');
    //     setPackager(platform, 'cjs');
    // }

    const promises = [];
    packagers.forEach(packager => packager.js && promises.push(packager.js.ready));
    await Promise.all(promises);

    console.log(2)
    return packagers;
}