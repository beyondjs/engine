const {utils: {fs}, platforms} = global;

/**
 * Build config.js file
 *
 * @param builder {object} The builder object
 * @param distribution {object} Distribution specification
 * @param path {string} The build target path
 * @returns {Promise<void>}
 */
module.exports = async function (builder, distribution, path) {
    'use strict';

    const {platform} = distribution;
    if (!platforms.node.includes(platform)) return;

    builder.emit('message', 'Building index.js file');

    const {application: {scope, name}} = builder;
    let output = `globalThis.__app_package = {specifier: '${scope ? `@${scope}/${name}` : name}'};\n`;
    output += `Object.defineProperty(globalThis, 'brequire', {get: () => require});\n`;
    output += `Object.defineProperty(globalThis, 'bimport', {get: () => async specifier => require(specifier)});\n\n`;
    output += `require('./start.js');`;

    const target = require('path').join(path, 'index.js');
    await fs.save(target, output);
}
