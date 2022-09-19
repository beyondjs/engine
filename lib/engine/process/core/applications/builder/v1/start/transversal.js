const {fs} = global.utils;

/**
 * Build transversal start
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @param uglifier {object} The uglifier
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path, uglifier) {
    'use strict';

    builder.emit('message', 'Building start.js transversal file');

    // Build start.js
    const {application} = builder;
    await application.transversals.ready;
    const resource = application.transversals.get('start').packagers.get(distribution);
    await resource.js.ready;

    let {errors, valid} = resource.js;
    const code = resource.js.code();
    if (!valid) {
        builder.emit('error', 'Error on application start code');
        errors.forEach(error => builder.emit('error', `  -> ${error}`));
        return;
    }

    const target = require('path').join(path, 'start.js');
    if (distribution.compress) {
        let errors;
        ({code, errors} = uglifier.uglify('start.js', code));

        errors && builder.emit('error', 'Error uglifying application start');
        errors?.forEach(({message, line, col}) => builder.emit('error', `    -> [${line}, ${col}] ${message}`));
        !errors && await fs.save(target, code);
        return;
    }

    await fs.save(target, code);
}