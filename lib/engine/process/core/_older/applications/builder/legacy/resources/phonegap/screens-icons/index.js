/**
 * Create and copy icons and splash resources
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The destination path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
    'use strict';

    const fs = global.utils.fs;

    const sizes = require('./sizes.js')[distribution.platform];

    let dirname = require('path').join(
        path,
        'resources'
    );

    await fs.mkdir(require('path').join(dirname, 'icons'), {'recursive': true});
    await fs.mkdir(require('path').join(dirname, 'screens'), {'recursive': true});

    builder.emit('message', 'Building icons resources');

    const {application} = builder;
    for (const size of sizes.icons) {

        const target = require('path').join(
            dirname,
            'icons',
            `${size}.png`
        );

        // Do not rebuild icon if it was already created
        if (!distribution.icons && await fs.exists(target)) continue;

        const resource = await application.resources.icons.get(parseInt(size), parseInt(size), distribution.icons);
        if (!resource) return;

        await fs.copyFile(resource.file, target);

    }

    builder.emit('message', 'Building screens resources');

    for (const size of sizes.screens) {

        const [width, height] = size.split('x');

        const target = require('path').join(
            dirname,
            'screens',
            `${width}x${height}.png`
        );

        // Do not rebuild screen if it was already created
        if (!distribution.icons && await fs.exists(target)) continue;

        const resource = await application.resources.screens.get(
            parseInt(width),
            parseInt(height),
            distribution.icons
        );

        if (!resource) return;

        await fs.copyFile(resource.file, target);

    }

};
