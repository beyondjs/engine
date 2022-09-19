const find = require('./find');
const process = require('./process');

module.exports = async function (url, application) {
    'use strict';

    await application.modules.ready;
    const {module, resource} = find(url, application.modules.rpaths, application.modules.self.path);
    if (module) return await process(module, resource);

    for (const library of application.libraries.values()) {
        await library.modules.resources.ready;
        if (!library.valid) continue;
        const {module, resource} = find(url, library.modules.resources, library.modules.path);

        if (module) return await process(module, resource);
    }
}
