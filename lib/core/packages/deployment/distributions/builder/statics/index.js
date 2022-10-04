const fs = require('beyond/utils/fs');

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

    builder.emit('message', 'Copying application static resources');

    const {application} = builder;
    await application.static.ready;

    const staticItems = new Set();
    for (const resource of application.static) {
        const entry = resource.relative.file.replace(/\\/g, '/');
        staticItems.add(`./${entry}`);
        const target = require('path').join(path, resource.relative.file);
        await fs.mkdir(require('path').dirname(target), {'recursive': true});
        await fs.copyFile(resource.file, target);
    }

    return staticItems;
}