const fs = require('fs').promises;
const {join, dirname} = require('path');

module.exports = async function (bundle, code, map) {
    'use strict';

    // The container of the bundle can be a library or a module
    const {pkg} = bundle;
    const root = pkg.modules.path;

    const save = async (resource, content) => {
        const dir = dirname(resource);

        try {
            await fs.mkdir(dir, {recursive: true});
            await fs.writeFile(resource, content, 'utf8');
        }
        catch (exc) {
            console.log(`Error saving declaration of bundle "${bundle.id}". ${exc.message}`);
        }
    }

    await save(join(root, 'node_modules', `${bundle.specifier}.d.ts`), code);
    await save(join(root, 'node_modules', `${bundle.specifier}.d.ts.map`), map);
}
