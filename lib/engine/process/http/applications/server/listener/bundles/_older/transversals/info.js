/**
 * Show diagnostics of a declaration or packager code
 *
 * @param transversal {object} The transversal packager
 * @return {Promise<string>}
 */
module.exports = async function (transversal) {
    let content = `<h1>Transversal bundle diagnostics report</h1>`;

    const showErrors = (container, title) => {
        const {length} = container.errors;
        if (!length) return;

        title = title ? ` ${title}` : '';
        content += `<h2>${length} ${length === 1 ? 'error' : 'errors'} found${title}:</h2><ul>`;
        container.errors.forEach(error => content += `<li>${error}</li>`);
        content += '</ul>';
    }

    showErrors(transversal);
    showErrors(transversal.js, 'on code packager');

    return `<html lang="en"><body>${content}</body></html>`;
}
