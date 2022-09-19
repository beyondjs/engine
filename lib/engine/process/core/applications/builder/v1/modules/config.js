const {utils: {fs}} = global;

/**
 * Build config.js file of libraries/projects imported
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
    'use strict';

    if (!distribution.npm) return;

    const {application: {libraries}} = builder;
    await libraries.ready;

    const promises = [];
    libraries.forEach(al => promises.push(al.ready));
    await Promise.all(promises);

    promises.length = 0;
    libraries.forEach(al => promises.push(al.library.config.get(distribution).ready));
    await Promise.all(promises);

    promises.length = 0;
    for (const al of libraries.values()) {
        //not build beyond-local config.js, is a devDependency
        if (al.pkg === '@beyond-js/inspect') continue;

        if (!al.valid) continue;

        builder.emit('message', `. Building "${al.pkg}" config.js file`);

        console.log(3, al.pkg, al.specifier, al.name)

        const config = al.library.config.get(distribution);
        const target = require('path').join(path, 'packages', al.pkg, `config.js`);
        promises.push(fs.save(target, config.code));
    }

    await Promise.all(promises);
}