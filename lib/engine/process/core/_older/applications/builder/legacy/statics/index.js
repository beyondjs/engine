const {fs} = global.utils;

/**
 * Compile application static resources
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The destination path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
    'use strict';

    builder.emit('message', 'Copying static resources');

    const {application} = builder;
    await application.static.ready;
    for (const resource of application.static) {
        const target = require('path').join(path, resource.relative.file);
        await fs.mkdir(require('path').dirname(target), {'recursive': true});
        await fs.copyFile(resource.file, target);
    }
}
