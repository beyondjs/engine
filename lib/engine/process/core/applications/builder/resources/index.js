/**
 * Build mode specific resources, as icons, splash, configuration files
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
    const {platforms} = global;
    const {platform} = distribution;

    if (!platforms.webAndMobile.includes(platform)) return;

    require(`./${platforms.web.includes(platform) ? 'web' : 'cordova'}`)(builder, distribution, path);
}
