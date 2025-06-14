/**
 * Show diagnostics of the template application (styles.css) and global styles (global.css)
 *
 * @param styles {object}
 * @return {Promise<*>}
 */
module.exports = async function (styles) {
    let content = `<h1>Application styles diagnostics report</h1>`;
    content += `<h2>Diagnostics report</h2>`;

    const {diagnostics} = styles;
    const {valid} = diagnostics;

    if (diagnostics.valid) {
        content += 'No errors reported.';
    }

    if (diagnostics.general.length) {
        diagnostics.general.forEach(error => {
            content += `<li>${error}</li>`;
        });
    }

    const processList = (name, list) => {
        if (!list || !list.size) return;

        content += `<h3>Errors found on ${list.size} ` +
            `${list.size === 1 ? name.singular : name.plural}</h3>`;

        list.forEach((diagnostics, source) => {
            content += `<h4>${source}</h4><ul>`;
            diagnostics.forEach(diagnostic => {
                const {line, character} = diagnostic;
                const position = line && character ? `${line}:${character} - ` : '';
                content += `<li>${position}${diagnostic.message}</li>`;
            });
            content += '</ul>';
        });
    };
    processList({singular: 'file', plural: 'files'}, diagnostics.files);

    return await require('../info/html')(content, valid ? '200' : '500');
}
