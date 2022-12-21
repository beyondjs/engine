/**
 * Recursively create a directory
 *
 * @param target {string} The target directory
 * @param mkdir
 * @returns {Promise<void>}
 */
module.exports = async function (target, mkdir) {
    'use strict';

    const fs = require('..');

    if (await fs.exists(target)) return;

    const sep = require('path').sep;
    const folders = target.split(sep);

    let path = sep === '\\' ? folders.shift() : '/';

    for (const folder of folders) {

        path = require('path').join(path, folder);
        if (await fs.exists(path)) continue;

        try {
            await mkdir(path);
        }
        catch (exc) {
            // If errno is -17 (iOS), -4075 (Windows), the directory already exists, avoid to show an error
            if (![-17, -4075].includes(exc.errno)) {
                console.trace(1);
                throw new Error(`Error creating directory: ${exc.errno}: ${exc.message}`);
            }
        }

    }

};
