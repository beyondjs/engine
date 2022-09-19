const CompiledSource = (require('../../source'));

module.exports = function (compiler, sources, updated, emitted, diagnostics) {
    const {processor, distribution} = compiler.packager;

    const processSource = (is, source) => {
        const {file} = source.relative;

        let declaration, code, map;

        // Remove the extension from the file
        let module = source.file;
        const extensions = (require('../extnames'));
        for (const ext of extensions) {
            if (module.endsWith(ext)) {
                module = module.substr(0, module.length - ext.length);
                break;
            }
        }

        // Get the compiled files of the current source
        for (const [file, content] of emitted) {
            if (!file.startsWith(module)) continue;
            const ext = file.substr(module.length);
            if (!['.js', '.d.ts', '.js.map'].includes(ext)) continue;

            if (ext === '.d.ts') declaration = content;
            else if (ext === '.js') code = content;
            else if (ext === '.js.map') map = content;
        }

        const compiled = (() => {
            // Check if the source has a previous complied version
            const collection = compiler[is === 'source' ? 'files' : 'extensions'];

            if (collection.has(file)) {
                const compiled = collection.get(file);
                compiled.update({declaration, code, map});
                return compiled;
            }

            // Create a new compiled source object
            return new CompiledSource(processor, distribution, is, source, {declaration, code, map});
        })();

        updated[is === 'source' ? 'files' : 'extensions'].set(file, compiled);

        if (compiled.declaration === void 0 || compiled.code === void 0 || compiled.map === void 0) {
            const diags = diagnostics.files.has(file) ? diagnostics.files.get(file) : [];
            diags.push({message: 'Declaration, map, or compiled code has not been emitted'});
            diagnostics.files.set(file, diags);
        }
    }

    const processSources = (collection, is) => collection.forEach(source => processSource(is, source));

    processSources(sources.files, 'source');
    processSources(sources.extensions, 'extension');
}
