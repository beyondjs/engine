const {utils: {fs}} = global;

/**
 * Build module static resources
 *
 * @param builder {object} The builder object
 * @param module {object} The module
 * @param path {string} The build target path
 * @return {Promise<void>}
 */
module.exports = async function (builder, module, path) {
    'use strict';

    await module.static.ready;
    const staticItems = new Set();
    for (let resource of await module.static.values()) {
        const relative = resource.file.relative.file;
        resource = resource.overwrite ? resource.overwrite : resource.file;
        const entry = require('path').join(module.subpath, relative).replace(/\\/g, '/');
        staticItems.add(`./${entry}`);

        const specifier = builder.application.package !== module.container.package ?
                          `packages/${module.specifier}` : module.subpath;
        const target = require('path').join(path, specifier, relative);
        await fs.mkdir(require('path').dirname(target), {'recursive': true});
        await fs.copyFile(resource.file, target);
    }

    return staticItems;
}