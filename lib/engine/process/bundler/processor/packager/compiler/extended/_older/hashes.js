module.exports = class extends Map {
    #processor;
    #extendedCompilers;

    constructor(processor, extendedCompilers) {
        super();
        this.#processor = processor;
        this.#extendedCompilers = extendedCompilers;
    }

    update() {
        this.#extendedCompilers.forEach((extendedCompiler, processorName) => {
            // Set the root hash of the compiler
            if (!extendedCompiler.hashes.extensions.has(this.#processor.name)) {
                throw new Error(`Extended root hash of compiler "${compiler.id}" not set`);
            }

            this.set(processorName, extendedCompiler.hashes.extensions.get(this.#processor.name));
        });
    }
}
