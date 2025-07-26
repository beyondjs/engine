/**
 * Show diagnostics of the project configuration
 *
 * @param config {object} The configuration object
 * @return {Promise<string>}
 */
module.exports = async function (config) {
    let content = `<h1>Project configuration diagnostics report</h1>`;

    content += (() => {
        if (config.valid) {
            return '<h2>Diagnostics:</h2><p>Project configuration is not reporting any errors.</p>';
        }

        const {length} = config.errors;
        let content = '';
        content += `<h2>${length} ${length === 1 ? 'error' : 'errors'} found:</h2><ul>`;
        config.errors.forEach(error => content += `<li>${error}</li>`);
        content += '</ul>';

        return content;
    })();

    return await require('../info/html')(content, errors?.length ? '200' : '500');
}
