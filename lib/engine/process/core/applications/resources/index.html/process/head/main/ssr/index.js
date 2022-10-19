/**
 * Add the code to fetch the page when ssr routing is on
 *
 * @param application {object} The application object
 * @param distribution {any} The distribution specification
 * @param local {{inspect: number}}
 * @return {Promise<string>}
 */
module.exports = async function (application, distribution, local) {
    if (!distribution.ssr || !application.routing.ssr) return '';

    const {distributions} = application.deployment;
    await distributions.ready;
    const found = [...distributions.values()].find(({name}) => distribution.ssr === name);
    if (!found) return '';

    const name = `${application.package}/${found.name}`;
    const port = local ? await require('./ports').get(name) : void 0;
    const host = local ? `http://localhost:${port}` : found.host;

    let code = '\n';
    code += '<script>\n';
    code += '// Fetch the page when ssr routing is on\n';
    code += 'uri = `${location.pathname}${location.search}`;\n';
    code += 'let language = localStorage.__beyond_language;\n';
    code += 'language = language ? language : navigator.language;\n';

    const url = `\`${host}/page?uri=\${uri}&language=\${language}\``;
    const options = {mode: 'cors'};
    code += `window.__ssr_fetch = new Promise(resolve => {\n` +
        `    fetch(${url}, ${JSON.stringify(options)})\n` +
        '        .then(response => response.json())\n' +
        '        .then(json => resolve({json}))\n' +
        '        .catch(exc => resolve({error: exc.message}));\n' +
        '    });\n';
    code += '</script>\n';

    return code;
}
