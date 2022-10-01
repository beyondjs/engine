const {fs} = global.utils;

module.exports = async function (builder, module, path) {
    'use strict';

    await module.static.ready;
    for (let resource of await module.static.values()) {
        const relative = resource.file.relative.file;
        resource = resource.overwrite ? resource.overwrite : resource.file;

        const target = require('path').join(
            path,
            module.pathname,
            relative);

        await fs.mkdir(require('path').dirname(target), {'recursive': true});
        await fs.copyFile(resource.file, target);
    }
}
