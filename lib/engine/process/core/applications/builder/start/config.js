const {utils: {fs}, platforms: {node}} = global;

/**
 * Build config.js file
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

    builder.emit('message', 'Building config.js file');

    const {application} = builder;
    const config = await application.config.get(distribution);
    await config.ready;
    const target = require('path').join(path, 'config.js');

    if (distribution.compress) {
        const {code, errors} = uglifier.uglify('start.js', config.code);
        errors ? builder.emit('error', 'Error uglifying application styles') : await fs.save(target, code);
        return
    }

    //includes config on package.json exports
    if (node.includes(distribution.platform)) exported.set('config.js', 'config');

    await fs.save(target, config.code);
}
