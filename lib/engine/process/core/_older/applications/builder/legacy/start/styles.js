const {fs} = global.utils;

/**
 * Build styles.css file
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, uglifier) {
    'use strict';

    builder.emit('message', 'Building styles.css file');

    const {application} = builder;
    const styles = await application.styles.application.get(distribution);
    if (styles) {
        await styles.ready;
        const target = require('path').join(path, 'styles.css');

        if (distribution.compress) {
            const {errors, css} = uglifier.uglify('styles.css', styles.value);
            errors ? builder.emit('error', 'Error uglifying application styles') : await fs.save(target, css);
        }
        else {
            await fs.save(target, styles.value);
        }
    }
}
