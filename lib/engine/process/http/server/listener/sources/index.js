const {join} = require('path');
const find = require('./find');
const processSource = require('./process');
const {fs} = global.utils;
const cwd = process.cwd();

module.exports = async function (url, application) {
    'use strict';

    if (url.pathname.includes('/node_modules/')) {
        const file = join(cwd, url.pathname);
        if (!(await fs.exists(file))) return;
        return new global.Resource({file});
    }

    await application.modules.ready;
    const {module, resource} = find(url, application.modules.rpaths, application.modules.self.path);
    if (module) return await processSource(module, resource);

    for (const library of application.libraries.values()) {
        await library.modules.resources.ready;
        if (!library.valid || !library.modules.path) continue;
        const {module, resource} = find(url, library.modules.resources, library.modules.path);

        if (module) return await processSource(module, resource);
    }
}
