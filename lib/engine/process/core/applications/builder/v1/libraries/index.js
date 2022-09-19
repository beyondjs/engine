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

    const {platforms} = global;
    const {platform} = distribution;
    if (platforms.node.includes(platform)) return;

    builder.emit('message', 'Copying libraries static resources');

    const {application} = builder;
    await application.libraries.ready;
    for (const library of application.libraries.values()) {
        await library.static.ready;

        for (let resource of library.static.values()) {
            const relative = resource.file.relative.file;
            resource = resource.overwrite ? resource.overwrite : resource.file;

            const target = require('path').join(path, 'packages', library.package, relative);
            await fs.mkdir(require('path').dirname(target), {'recursive': true});
            await fs.copyFile(resource.file, target);
        }
    }
}
