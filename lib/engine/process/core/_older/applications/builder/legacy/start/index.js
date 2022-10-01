/**
 * Build index.html, styles.css and transversals
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, uglifier) {
    'use strict';

    await require('./index-html')(builder, distribution, path, uglifier);
    await require('./config')(builder, distribution, path, uglifier);
    await require('./transversal')(builder, distribution, path, uglifier);
    await require('./styles')(builder, distribution, path, uglifier);
}
