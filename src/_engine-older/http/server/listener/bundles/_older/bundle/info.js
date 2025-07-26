/**
 * Show diagnostics of a declaration or packager code
 *
 * @return {Promise<string>}
 */
module.exports = async function ({bundle, packager, code, extname}) {
    bundle = bundle ? bundle : packager.bundle;
    const {container} = bundle;

    let content = '';
    content += '<h1>Bundle</h1>';
    content += container.container ? `<p><strong>Container package:</strong> ${container.container.package}</p>` : '';
    content += `<p><strong>Path:</strong> ${container.path}</p>`;
    content += `<p><strong>Resource:</strong> ${bundle.resource}</p>`;

    packager && (content += `<p><strong>Packager hash:</strong> ${packager.hash.value}</p>`);

    content += `<h1>Bundle diagnostics report</h1>`;

    const errors = !bundle.valid ? bundle.errors : (code ? code.errors : []);
    const {length} = errors;
    content += `<h2>${length} ${length === 1 ? 'error' : 'errors'} found:</h2><ul>`;
    errors.forEach(error => content += `<li>${error}</li>`);
    content += '</ul>';

    if (!bundle.valid || !packager) {
        return await require('../../info/html')(content, bundle.valid ? '200' : '500');
    }

    const {processors} = packager;
    for (const processor of processors.values()) {
        const {packager} = processor;
        if (!packager) continue;

        if (extname === '.js' && !packager.js) continue;
        if (extname === '.css' && !packager.css) continue;
        if (extname === '.d.ts' && !packager.declaration) continue;

        const {name} = processor;
        content += `<h2>Processor "${name}"</h2>`;

        const diagnostics = await (async () => {
            if (extname === '.d.ts') {
                await packager.declaration.ready;
                return packager.declaration.diagnostics;
            }
            else if (extname === '.js') {
                await packager.js.ready;
                return packager.js.diagnostics;
            }
            else {
                await packager.css.ready;
                return packager.css.diagnostics;
            }
        })();

        if (diagnostics?.valid) {
            content += 'No errors reported.';
        }
        else if (diagnostics) {
            if (diagnostics.general?.length) {
                diagnostics.general.forEach(error => content += `<li>${error}</li>`);
            }

            const processList = (name, list) => {
                if (!list) return;
                const filtered = new Map([...list].filter(([, diagnostics]) => !!diagnostics));
                if (!filtered.size) return;

                content += `<h3>Errors found on ${filtered.size} ` +
                    `${filtered.size === 1 ? name.singular : name.plural}</h3>`;

                filtered.forEach((diagnostics, source) => {
                    content += `<h4>${source}</h4><ul>`;
                    diagnostics.forEach(diagnostic => {
                        diagnostic = typeof diagnostic === 'string' ? {message: diagnostic} : diagnostic;
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
            processList({singular: 'extension', plural: 'extensions'}, diagnostics.extensions);
            processList({singular: 'backend bridge', plural: 'backend bridges'}, diagnostics.bridges);
        }
    }

    return await require('../../info/html')(content, code.valid ? '200' : '500');
}
