const {platforms} = require('beyond/cspecs');

/**
 * Build web favicon
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution) {
    'use strict';

    const {platform} = distribution;

    if (!platforms.web.includes(platform)) return;
    builder.emit('message', 'Building web configuration');
}
