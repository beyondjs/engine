/**
 * Build index.html, styles.css and transversals
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @param exported {Map} exported bundles by package
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, uglifier, exported) {
    'use strict';

    if (distribution.npm) return;

    await require('./config')(builder, distribution, path, uglifier, exported);
    await require('./index-js')(builder, distribution, path);
    await require('./transversal')(builder, distribution, path, uglifier);

    const {platforms} = global;
    const {platform} = distribution;
    if (!platforms.webAndMobile.includes(platform)) return;

    await require('./index-html')(builder, distribution, path, uglifier);
    await require('./styles')(builder, distribution, path, uglifier);
}
