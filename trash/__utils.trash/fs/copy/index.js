/**
 * Recursively copy all files of a directory
 */
module.exports = fs => async function (source, target) {
    'use strict';

    const copy = async function (source, target) {

        if ((await fs.stat(source)).isFile()) {
            await fs.copyFile(source, target);
            return;
        }

        const files = await fs.readdir(source);
        for (let file of files) {

            const from = require('path').join(source, file);
            const to = require('path').join(target, file);

            const stat = await fs.stat(from);

            if (stat.isDirectory()) {
                await fs.mkdir(to);
                await copy(from, to);
            }
            else if (stat.isFile()) {
                await fs.copyFile(from, to);
            }

        }

    };

    await fs.mkdir(target, {'recursive': true});
    await copy(source, target);

};
