/**
 * Build web favicon
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution) {
    'use strict';

    const {platforms} = global;
    const {platform} = distribution;

    if (!platforms.web.includes(platform)) return;
    builder.emit('message', 'Building web configuration');
}
