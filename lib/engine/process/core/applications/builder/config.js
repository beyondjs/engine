const {utils: {fs}, platforms: {node, webAndMobile}} = global;
const BUNDLES_MODE = {esm: 'mjs', cjs: 'cjs', amd: 'amd', sjs: 'sjs'};

/**
 * Build config.js file
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param modules {object} The modules
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, modules) {
    'use strict';

    if (!distribution.npm && node.includes(distribution.platform)) {
        return;
    }

    builder.emit('message', 'Building config.js file');

    //TODO faltan los exports y ver de que manera se puede mejorar para que la distribucion maneje los mode
    const setConfig = async (platform, mode) => {
        const key = `${platform}//${mode}`;
        const dist = Object.assign({},
            distribution, {key: key, platform: platform, bundles: {mode: mode}}
        );
        delete dist.npm;
        delete dist.platforms;

        const {application} = builder;
        const config = await application.config.get(dist);
        await config.ready;

        const extension = mode === 'esm' ? 'mjs' : `${BUNDLES_MODE[mode]}.js`;
        items.extensions = items.extensions.concat([extension]);

        const target = require('path').join(path, 'config', `config.${extension}`);
        await fs.save(target, config.code);
    };

    const {npm, platform} = distribution;
    let compilePlatforms = npm?.platforms;
    if (!distribution.npm) {
        compilePlatforms = {};
        compilePlatforms[platform] = platform;
    }

    let items = {subpath: 'config', extensions: []};

    const promises = [];
    for (const platform of Object.keys(compilePlatforms)) {
        if (webAndMobile.includes(platform)) {
            promises.push(setConfig(platform, 'amd'));
            continue;
        }

        promises.push(setConfig(platform, 'esm'));
        promises.push(setConfig(platform, 'cjs'));
        promises.push(setConfig(platform, 'sjs'));
    }
    await Promise.all(promises);

    modules.exported.set('config', items);
}