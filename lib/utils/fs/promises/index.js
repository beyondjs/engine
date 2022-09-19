module.exports = fs => async function (file, content) {
    'use strict';

    const dirname = require('path').dirname(file);
    await fs.mkdir(dirname, {'recursive': true});

    let handle;
    try {
        handle = await fs.promises.open(file, 'a+');
        await fs.promises.writeFile(file, content);
    }
    finally {
        handle !== undefined && await handle.close();
    }
}