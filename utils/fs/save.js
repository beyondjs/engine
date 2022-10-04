const fs = require('fs').promises;
const exists = require('./exists');

module.exports = async (file, content, options) => {
    'use strict';

    const dirname = require('path').dirname(file);
    await fs.mkdir(dirname, {'recursive': true});

    // Delete destination file if exists
    if (await exists(file)) {
        // Check if it is a file
        let stat = await fs.stat(file);
        if (!stat.isFile()) throw new Error(`Destination path is not a file: "${file}"`);

        // Delete the file
        await fs.unlink(file);
    }

    // Create the file
    const handler = await fs.open(file, 'w');
    await fs.close(handler);

    // Save the content
    await fs.appendFile(file, content, options);
}
