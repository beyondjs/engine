/**
 * Build web favicon
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution) {
    'use strict';

    if (distribution.platform !== 'web') return;
    builder.emit('message', 'Building web configuration');
}
