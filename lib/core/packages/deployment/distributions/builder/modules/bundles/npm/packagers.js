const {platforms: {webAndMobile}} = require('beyond/cspecs');

module.exports = async function ({module, bundle, distribution, language}) {
    const packagers = new Map();
    const modulePlatforms = [...module.platforms.keys()];

    const setPackager = (platform, mode) => {
        const key = `${platform}//${mode}`;
        //TODO add platform distribution to correspond, only NPM
        const dist = Object.assign({},
            distribution, {key: key, platform: platform, bundles: {mode: mode}}
        );
        delete dist.npm;
        delete dist.platforms;

        packagers.set(key, bundle.packagers.get(dist, language));
    };

    const {npm: {platforms}} = distribution;
    for (const platform of Object.keys(platforms)) {
        if (webAndMobile.includes(platform) && modulePlatforms.includes(platform)) {
            setPackager(platform, 'amd');
            continue;
        }

        if (!modulePlatforms.includes(platform)) continue;
        setPackager(platform, 'esm');
        setPackager(platform, 'cjs');
        setPackager(platform, 'sjs');
    }

    const promises = [];
    packagers.forEach(packager => packager.js && promises.push(packager.js.ready));
    await Promise.all(promises);

    return packagers;
}
