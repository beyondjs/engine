const fs = require('fs').promises;
const {join, dirname} = require('path');

module.exports = async function (bundle, code) {
    'use strict';

    // The container of the bundle can be a library or a module
    const {application} = bundle;
    const root = application.modules.self.path;

    const resource = join(root, 'node_modules', `${bundle.specifier}.d.ts`);
    const dir = dirname(resource);

    try {
        await fs.mkdir(dir, {recursive: true});
        await fs.writeFile(resource, code, 'utf8');
    }
    catch (exc) {
        console.log(`Error saving declaration of bundle "${bundle.id}". ${exc.message}`);
    }
}
