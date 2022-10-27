module.exports = class {
    #compiler;

    #sources;
    get sources() {
        return this.#sources;
    }

    #inputs;
    get inputs() {
        return this.#inputs;
    }

    #extensions;
    get extensions() {
        return this.#extensions;
    }

    constructor(compiler) {
        this.#compiler = compiler;
    }

    /**
     * The compiler is in sync when its last update was made with the same code of the inputs of its processor
     * and the code of its extensions is up to date.
     * Otherwise, it means that the latest change updates have not yet been received from the child processors.
     * @return {boolean}
     */
    get synchronized() {
        if (!this.updated) return false;

        const {hashes} = this.#compiler.packager.processor;
        if (!hashes.synchronized) return false;

        for (const [processor, extension] of hashes.extensions) {
            if (extension !== this.#extensions.get(processor)) return false;
        }
        return true;
    }

    /**
     * The compiler is up to date when its inputs match the last processed
     * @return {boolean}
     */
    get updated() {
        const {hashes} = this.#compiler.packager.processor;
        return this.#inputs === hashes.inputs;
    }

    update() {
        const {hashes} = this.#compiler.packager.processor;
        this.#sources = hashes.sources;
        this.#inputs = hashes.inputs;
        this.#extensions = new Map(hashes.extensions);
    }

    hydrate(cached) {
        this.#sources = cached.sources;
        this.#inputs = cached.inputs;
        this.#extensions = new Map(cached.extensions);
    }

    toJSON() {
        return {sources: this.#sources, inputs: this.#inputs, extensions: [...this.#extensions]};
    }
}
