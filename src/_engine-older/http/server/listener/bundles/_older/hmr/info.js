/**
 * Show diagnostics of a declaration or packager code
 *
 * @param processor {object} The processor
 * @param hmr {object} The hmr code
 * @return {Promise<string>}
 */
module.exports = async function (processor, hmr) {
    const {valid} = hmr;
    const {packager} = processor
    let content = `<h1>Bundle diagnostics report</h1>`;

    const {length} = hmr.errors;
    content += `<h2>${length} ${length === 1 ? 'error' : 'errors'} found:</h2><ul>`;
    hmr.errors.forEach(error => content += `<li>${error}</li>`);
    content += '</ul>';

    await packager.compiler.ready;
    const {diagnostics} = packager.compiler;
    if (!diagnostics) return content;

    const {name} = packager.processor;
    content += `<h2>Processor "${name}"</h2>`;
    if (diagnostics.valid) {
        content += 'No errors reported.';
    }
    else {
        if (diagnostics.general?.length) {
            diagnostics.general.forEach(error => content += `<li>${error}</li>`);
        }

        const processList = (name, list) => {
            if (!list || !list.size) return;

            content += `<h3>Errors found on ${list.size} ` +
                `${list.size === 1 ? name.singular : name.plural}</h3>`;

            list.forEach((diagnostics, source) => {
                if (!diagnostics) return;

                content += `<h4>${source}</h4><ul>`;
                diagnostics.forEach(diagnostic => {
                    const {line, character} = diagnostic;
                    const position = line && character ? `${line}:${character} - ` : '';
                    content += `<li>${position}${diagnostic.message}</li>`;
                });
                content += '</ul>';
            });
        };
        processList({singular: 'dependency', plural: 'dependencies'}, diagnostics.dependencies);
        processList({singular: 'file', plural: 'files'}, diagnostics.files);
        processList({singular: 'overwrite', plural: 'overwrites'}, diagnostics.overwrites);
        processList({singular: 'backend bridge', plural: 'backend bridges'}, diagnostics.bridges);
    }

    return require('../../info/html')(content, valid ? '200' : '500');
}
