/**
 * Include require.js, its configuration and launch the initial scripts
 *
 * @param baseDir
 * @param application
 * @param distribution
 * @param required
 * @param local
 * @return {Promise<string>}
 */
module.exports = async function (baseDir, application, distribution, required, local) {
    'use strict';

    const vspecifier = await require('./vspecifier')(application, distribution);

    const baseUrl = `${baseDir}packages`;
    let code = '\n';
    code += `<script src="${baseDir}packages/${vspecifier}/vendor/require.min.js"></script>\n`;

    code += '<script>\n';
    code += local ? 'requirejs.config({waitSeconds: 30});\n' : '';
    code += `const paths = {'${application.vspecifier}': baseUrl.endsWith(\'/\') ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl};\n`;
    code += `requirejs.config({baseUrl: '${baseUrl}', paths});\n`;

    const hmr = require('./local')(required) && distribution.development.tools && local?.inspect ?
                `, () => brequire('@beyond-js/local/main').local.register(${local.inspect})` : '';
    code += `require(${JSON.stringify(required)}${hmr});\n`;

    code += `require(['${application.vspecifier}/start']);\n`;
    code += '</script>\n';

    return code;
}
