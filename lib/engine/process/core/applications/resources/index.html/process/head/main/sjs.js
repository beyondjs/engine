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

    let code = '\n';
    code += `<script src="${baseDir}packages/@beyond-js/kernel/vendor/s.js"></script>\n`;

    code += '<script type="module">\n';
    code += `const {specifier, vspecifier} = window.__app_package;\n`;
    code += `const baseDir = '${baseDir}';\n`;
    code += `System.constructor.prototype.resolve = (id, parent) => {\n`;
    code += `    let [resource, qs] = id.split('?');\n`;
    code += '    qs = qs ? `?${qs}` : \'\';\n';
    code += `    const split = resource.split('/');\n`;
    code += '    const pkg = split[0].startsWith(\'@\') ? `${split.shift()}/${split.shift()}` : split.shift();\n\n';
    code += `    const subpath = split.join('/');\n`;

    code += '    if ([specifier, vspecifier].includes(pkg)) return `${baseDir}${subpath}.js${qs}`;\n';
    code += '    return `${baseDir}packages/${pkg}${subpath ? `/${subpath}` : ``}.js${qs}`;\n';
    code += `};\n`;
    code += `Promise.all([\n`;
    code += required.map(mod => `  System.import('${mod}')`).join(',\n');
    code += ']);\n';
    code += '</script>\n';

    return code;
}
