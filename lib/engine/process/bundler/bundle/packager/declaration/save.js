const fs = require('@beyond-js/fs');
const {join, dirname} = require('path');

const cwd = process.cwd();

module.exports = async function (bundle, code) {
    'use strict';

    const save = async function (file) {
        try {
            await fs.mkdir(dirname(file), {recursive: true});
            await fs.writeFile(file, code, 'utf8');
        }
        catch (exc) {
            console.log(`Error saving bundle types "${file}": ${exc.message}`);
        }
    }

    // Save the types on the package node_modules folder
    const {application} = bundle;
    const root = application.modules.self.path;
    await save(join(root, 'node_modules', `${bundle.specifier}.d.ts`));

    // Save the types on the '.beyond/types' folder
    await save(join(cwd, '.beyond/types/', `${bundle.vspecifier}.d.ts`));
}
