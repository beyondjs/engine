/**
 * Show diagnostics of a transversal
 *
 * @return {Promise<string>}
 */
module.exports = async function ({bundle, code}) {
    let content = `<h1>Transversal bundle diagnostics report</h1>`;

    const process = (container, title) => {
        const {length} = container.errors;
        if (!length) return `<h2>No errors found ${title}</h2>`;

        let content = '';
        content += `<h2>${length} ${length === 1 ? 'error' : 'errors'} found ${title}:</h2><ul>`;
        container.errors.forEach(error => content += `<li>${error}</li>`);
        content += '</ul>';
        return content;
    }

    content += process(bundle, 'on bundle');

    await code?.ready;
    content += code ? process(code, 'on code packager') : '';

    content = `<html lang="en"><body>${content}</body></html>`;
    return await require('../../info/html')(content, code.valid ? '200' : '500');
}
