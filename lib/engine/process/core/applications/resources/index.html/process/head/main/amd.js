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

    const baseUrl = `${baseDir}packages`;
    let code = '\n';
    code += `<script src="${baseDir}packages/@beyond-js/kernel/vendor/require.min.js"></script>\n`;

    code += '<script>\n';
    code += local ? 'requirejs.config({waitSeconds: 30});\n' : '';

    const {vspecifier} = application;
    code += `const paths = {'${vspecifier}': baseUrl.endsWith(\'/\') ? baseUrl.slice(0, baseUrl.length - 1) : baseUrl};\n`;
    code += `requirejs.config({baseUrl: '${baseUrl}', paths});\n`;

    const hmr = distribution.development.tools && local?.inspect ?
                `, () => brequire('@beyond-js/local/main').local.register(${local.inspect})` : '';
    code += `require(${JSON.stringify(required)}${hmr});\n`;

    code += `require(['${vspecifier}/start']);\n`;
    code += '</script>\n';

    return code;
}
