/**
 * Show diagnostics of a external resource
 *
 * @param errors {string[]} The errors of the external resource
 * @param dependencies {string[]} The dependencies of the external resource
 * @return {Promise<string>}
 */
module.exports = async function (errors, dependencies) {
    let content = `<h1>External resource diagnostics report</h1>`;

    content += (() => {
        if (!errors?.length) {
            return '<h2>Diagnostics:</h2><p>External resource is not reporting any errors or warnings.</p>';
        }

        const {length} = errors;
        let content = '';
        content += `<h2>${length} ${length === 1 ? 'error' : 'errors'} found:</h2><ul>`;
        errors.forEach(error => content += `<li>${error}</li>`);
        content += '</ul>';

        return content;
    })();

    (() => {
        if (!dependencies) return;

        const {length} = dependencies;
        content += `<h2>${length} ${length === 1 ? 'dependency' : 'dependencies'} found:</h2>`;
        dependencies.forEach(({id, path}) => {
            content += `<h3>${id}</h3>`;
            content += '<ul>';
            content += `<li>path: ${path}</li>`;
            content += '</ul>';
        });
    })();

    return await require('../info/html')(content, errors?.length ? '200' : '500');
}
