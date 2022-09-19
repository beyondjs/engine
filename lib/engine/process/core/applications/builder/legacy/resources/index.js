/**
 * Build mode specific resources, as icons, splash, configuration files
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @returns {Promise<void>}
 */
module.exports = (builder, distribution, path) =>
    require(`./${distribution.platform === 'web' ? 'web' : 'phonegap'}`)(builder, distribution, path);
