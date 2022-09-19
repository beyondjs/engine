const CompiledSource = require('./source');

module.exports = class extends Map {
    process(files, compilation) {
        // Process the files specified in the processor configuration
        [...files.keys()].forEach(file => {
            const compiled = new CompiledSource(file, compilation);
            this.set(compiled.file, compiled);
        });
    }

    toJSON() {
        return [...this];
    }
}
