/**
 * Include require.js, its configuration and launch the initial scripts
 *
 * @param baseDir
 * @param application
 * @param distribution
 * @param required
 * @return {Promise<string>}
 */
module.exports = async function (baseDir, application, distribution, required) {
    'use strict';

    let code = '';

    const dependencies = application.dependencies.get(distribution);
    await dependencies.ready;
    const importMap = JSON.stringify(dependencies.importMap);

    code += `<script type="importmap">${importMap}</script>\n`;
    code += '<script type="module">\n';
    code += `import '${baseDir}start.js';\n`;
    required.forEach(required => code += `import '${required}';\n`);
    code += '</script>\n';

    return code;
}
