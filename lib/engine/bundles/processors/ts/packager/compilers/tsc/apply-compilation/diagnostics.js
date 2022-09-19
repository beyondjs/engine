const Diagnostic = require('../../diagnostic');
const {sep} = require('path');

module.exports = function (processor, sources, diagnostics, diagnosed) {
    for (let diagnostic of diagnosed) {
        diagnostic = new Diagnostic(diagnostic);

        // If file is not set, add the diagnostic to the general diagnostics
        if (!diagnostic.file) {
            diagnostics.general.push(diagnostic.message);
            continue;
        }

        let file = typeof diagnostic.file === 'string' ? diagnostic.file : diagnostic.file.fileName;
        file = sep === '/' ? file : file.replace(/\//g, sep);

        const set = (collection, file) => {
            let errors;
            if (collection.has(file)) {
                errors = collection.get(file);
            }
            else {
                errors = [];
                collection.set(file, errors);
            }
            errors.push(diagnostic);
        }

        if (sources.files.has(file)) {
            set(diagnostics.files, sources.files.get(file).relative.file);
        }
        else if (sources.extensions.has(file)) {
            set(diagnostics.extensions, sources.extensions.get(file).relative.file);
        }
        else {
            set(diagnostics.dependencies, file);
        }
    }
}
